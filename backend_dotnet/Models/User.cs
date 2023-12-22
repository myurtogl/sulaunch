using SU_COIN_BACK_END.Constants.UserRoleConstants;

namespace SU_COIN_BACK_END.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Surname { get; set; } = "";
        public string Address { get; set; } = "";
        public string? MailAddress { get; set; } = "";
        public string Username { get; set; } = "";
        public string Role { get; set; } = UserRoleConstants.BASE;
        public Nullable<int> Nonce { get; set; } = null;

        public string VerificationToken { get; set; } = "";
        public DateTime? VerificationExpiration { get; set; } = null;
        public bool IsVerified { get; set; } = false;


    }
}