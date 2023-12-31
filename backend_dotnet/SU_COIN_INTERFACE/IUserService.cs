using System.Threading.Tasks;
using SU_COIN_BACK_END.Response;
using SU_COIN_BACK_END.DTOs;
using SU_COIN_BACK_END.Request;


namespace SU_COIN_BACK_END.SU_COIN_INTERFACE
{
    public interface IUserService
    {
        Task<ServiceResponse<string>> DeleteUser();
        Task<ServiceResponse<UserDTO>> UpdateUser(UserDTO user);
        Task<ServiceResponse<UserDTO>> GetUser();
        Task<ServiceResponse<int>> GivePermissionToProject(ProjectPermissionRequest request);
        Task<ServiceResponse<string>> EvaluatePendingProjectPermission(ProjectPermissionRequest request);
        Task<ServiceResponse<List<UserDTO>>> GetAllUsers();
        Task<ServiceResponse<Int32>> LearnUserCount();
        Task<ServiceResponse<List<UserDTO>>> GetCoOwners(int projectID);
        Task<ServiceResponse<string>> RemovePermissionToProject(ProjectPermissionRequest request);
        Task<ServiceResponse<string>> UpdateUserRole(string address, string newRole);
        Task<ServiceResponse<string>> DeleteUserAsAdmin(int userID);
    }
}