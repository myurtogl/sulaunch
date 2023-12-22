using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Http;
using SU_COIN_BACK_END.Models;
using SU_COIN_BACK_END.DTOs;
using SU_COIN_BACK_END.SU_COIN_INTERFACE;
using SU_COIN_BACK_END.Response;
using SU_COIN_BACK_END.Request;
using SU_COIN_BACK_END.Constants.MessageConstants;
using Nethereum.Web3;
using Nethereum.Util;
using Nethereum.Signer;
using AutoMapper;
using SU_COIN_BACK_END.Data;
using System.Security.Cryptography;
using SU_COIN_BACK_END.Constants.UserRoleConstants;
using System.Net;
using MimeKit;
using MailKit.Net.Smtp;
using System.Web;

namespace SU_COIN_BACK_END.Services
{
    public class AuthenticationService : IAuthencticationService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IChainInteractionService _chainInteractionService;
        private int GetUserId() => int.Parse(_httpContextAccessor.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier));
        public AuthenticationService(IMapper mapper, DataContext dataContext, IHttpContextAccessor httpContextAccessor, IConfiguration configuration, IChainInteractionService chainInteractionService)
        {
            _mapper = mapper;
            _context = dataContext;
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
            _chainInteractionService = chainInteractionService;
        }

        private string GenerateVerificationToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);

            }
        }

        private async Task SendVerificationEmail(string email, string token)
        {
            String backendurl = Environment.GetEnvironmentVariable("REACT_APP_BACKEND_URL") ?? "http://localhost:5001";
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("Sulaunch", "sulaunch@gmail.com"));
            message.To.Add(new MailboxAddress("",email));
            message.Subject = "Email Verification";
            message.Body = new TextPart("html")


            /*<div style='display:flex;justify-content:center;flex-direction:column;text-align:center;color:#173A6A;font-family:'Montserrat', sans-serif; background-color:white'>
        <h1>Welcome To SuLaunch</h1>
        <p style="color:black">To complete your registeration, please click the link down below.</p><a style='margin:auto;padding:1rem 3rem;background-color:#173a6a;border-radius:100px;color:white;text-decoration:none;font-family:'Montserrat', sans-serif;font-weight:800' href='{backendurl}/Authentication/verify-email?token={token}&amp;email={email}'>Click Here</a>
    <p>If the link does not work, please copy the link below and paste it to the address bar of your browser.</p>
    <p>{backendurl}/Authentication/verify-email?token={token}&amp;email={email}</p>
    
    </div>*/


            {
                Text = $"<div style='display:block;text-align:center;background-color:white;width:75%'><h1 style='width:100%;color:#173a6a;'>Welcome To SuLaunch</h1><p style='color:black;width:100%'>To complete your registeration, please click the link down below.</p><div style='width:100%;padding:1rem 0'><a style='margin:auto;padding:1rem 3rem;background-color:#173a6a;border-radius:100px;color:white;text-decoration:none;font-weight:800' href='{backendurl}/Authentication/verify-email?token={token}&amp;email={email}'>Click Here To Verify</a></div><p style='width:100%'>If the link does not work, please copy the link below and paste it to the address bar of your browser.</p><p style='width:100%'>{backendurl}/Authentication/verify-email?token={token}&amp;email={email}</p></div>",

                //Text = $"<Please click <a href='{backendurl}/Authentication/verify-email?token={token}&email={email}'>here</a> to verify your email address. If the link does not verify by clicking, please copy and paste it into the address bar of your web browser."
            
            
            };

            using (var client = new SmtpClient())
            {
                client.Connect("smtp.gmail.com", 587);
                client.Authenticate("sulaunch@gmail.com", "pmasyfluglvfgvkn");
                await client.SendAsync(message);
                client.Disconnect(true);
            }
        }

        public async Task<ServiceResponse<int>> GetNonce(string address)
        {
            ServiceResponse<int> response = new ServiceResponse<int>();
            try
            {
                User? user = await _context.Users.FirstOrDefaultAsync(c => c.Address == address);
                if (user == null)
                {
                    response.Message = MessageConstants.USER_NOT_FOUND;
                    return response;
                }
                RNGCryptoServiceProvider csp = new RNGCryptoServiceProvider();
                byte[] randomNumber = new byte[32];
                csp.GetBytes(randomNumber);
                if (BitConverter.IsLittleEndian)
                {
                    Array.Reverse(randomNumber);
                }
                int nonce = Math.Abs(BitConverter.ToInt32(randomNumber, 0)); // randomly assigned nonce value
                Console.WriteLine($"Nonce: {nonce}");
                user.Nonce = nonce;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                response.Success = true;
                response.Message = MessageConstants.OK;
                response.Data = nonce;
            }
            catch (Exception e)
            {
                response.Message = e.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<string>> Login(UserLoginRequest request)
        {   
            ServiceResponse<string> response = new ServiceResponse<string>();
            try
            {  
                User? user = await _context.Users.FirstOrDefaultAsync(c => c.Address == request.Address);
                if (user == null) // user check
                {
                    response.Message = MessageConstants.USER_NOT_FOUND;
                    return response;
                }

                if (!user.IsVerified) // email verification check
                {
                    response.Message = "You must verify your email before logging in";
                    return response;
                }

                if (user.Nonce == null) // nonce check
                {
                    response.Message = $"You should first create the nonce from /authentication/getnonce/{request.Address}";
                    return response;
                }

                var signer = new EthereumMessageSigner();
                var addressRec = signer.EncodeUTF8AndEcRecover("LOGIN: " + user.Nonce.ToString(), request.SignedMessage);
                
                if (request.Address != addressRec) // verification of the user signature
                {
                    response.Message =  $"Signature provided does belong to the address: {request.Address}";
                    return response;
                }
                
                ServiceResponse<string> chainResponse = await _chainInteractionService.GetChainRole(user.Address);
                Console.WriteLine($"Response Message --> {chainResponse.Message}"); // Debuging

                if (!chainResponse.Success)
                {
                    response.Message = chainResponse.Message;
                    return response;
                }

                string? chainRole = chainResponse.Data;

                if (chainRole == null) // Although response returned successfully, user role is not found in the chain
                {
                    throw new Exception(MessageConstants.USER_ROLE_NOT_FOUND_IN_CHAIN);
                }
                else
                {

                    user.Nonce = null; // to provide security
                    user.Role = chainRole;
                    
                    response.Success = true;
                    response.Message = MessageConstants.OK;
                    response.Data = GenerateToken(user);

                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception e)
            {
                response.Message = String.Format(MessageConstants.FAIL_MESSAGE, "login", e.Message);
            }
            return response;
        }

        public async Task<ServiceResponse<string>> VerifyEmail(string email, string token)
        {
            ServiceResponse<string> response = new ServiceResponse<string>();
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.MailAddress == email && u.VerificationToken == token);

                if (user == null)
                {
                    response.Message = "Invalid token or email.";
                    return response;
                }
                if ( user.VerificationExpiration < DateTime.UtcNow)
                {
                    response.Message = "Token has expired.";
                    return response;
                }

                if (user.IsVerified)
                {
                    response.Message = "Email already verified.";
                    return response;
                }

                user.IsVerified = true;
                user.VerificationToken =  "";
                user.VerificationExpiration = null;
                await _context.SaveChangesAsync();

                response.Message = "Email verified successfully.";
                response.Success = true;
            }
            catch (Exception e)
            {
                response.Message = String.Format(MessageConstants.FAIL_MESSAGE, "verify email", e.Message);
            }

            return response;
        }

        public async Task<ServiceResponse<string>> Register(UserRegisterRequest request)
        {
            
            ServiceResponse<string> response = new ServiceResponse<string>();
            try
            {
                if (request == null || request.Name == null || request.Surname == null || request.MailAddress == null || request.Username == null)
                {
                    response.Message = MessageConstants.INVALID_INPUT;
                    Console.WriteLine(response.Message);
                    return response;
                }

                var signer = new EthereumMessageSigner();
                var addressRec = signer.EncodeUTF8AndEcRecover("REGISTER", request.SignedMessage);
                
                if (await UserExists(addressRec,request.MailAddress,request.Username) )
                {
                    response.Message = "User Already Exists";
                    Console.WriteLine(response.Message);
                    return response;
                }




                User user = new User 
                {
                    Name = request.Name,
                    Surname = request.Surname,
                    Username = request.Username, 
                    MailAddress = request.MailAddress, 
                    Address = addressRec,
                    VerificationToken = GenerateVerificationToken(),
                    VerificationExpiration = DateTime.UtcNow.AddMinutes(30)
                    
                };

                await SendVerificationEmail(request.MailAddress, HttpUtility.UrlEncode(user.VerificationToken));

                user.IsVerified = false;


                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                response.Message = MessageConstants.REGISTER_SUCCESSFUL_EMAIL;
                response.Data = Convert.ToString(user.Id);
                response.Success = true;
            }
            catch (Exception e)
            {
                response.Message = String.Format(MessageConstants.FAIL_MESSAGE, "register", e.Message);
            }
            return response;
        }
        public async Task<bool> UserExists(string address,string email,string username)
        {
            return await _context.Users.AnyAsync(x => x.Address == address || x.MailAddress == email || x.Username == username);
        }

        public async Task<bool> UserNameExists(string username)
        {
            if (await _context.Users.AnyAsync(x => x.Username == username))
            {
                return true;
            }
            return false;
        }
        private string GenerateToken(User user)
        {
           List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.Surname, user.Address)
            };

            SymmetricSecurityKey key = new SymmetricSecurityKey
            (
                Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value)
            );

            SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddHours(2),
                SigningCredentials = creds
            };

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}