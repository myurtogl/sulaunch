using SU_COIN_BACK_END.Constants.ProjectStatusConstants;
using System.ComponentModel.DataAnnotations;


namespace SU_COIN_BACK_END.Models
{
    public class Project
    {
        public int ProjectID { get; set; }

        // [Required()]
        [Required()]

        public string? ProjectName { get; set; }
        public Nullable<System.DateTime> Date { get; set; }
        public bool ViewerAccepted { get; set; } = false;
        public bool IsAuctionCreated { get; set; } = false;
        public bool IsAuctionStarted { get; set; } = false;
        public string? FileHash { get; set; } = "";

        [Required()]
        public string? ProjectDescription { get; set;}
        public double Rating { get; set; } = 0;
        public string? Status { get; set; } = ProjectStatusConstants.PENDING;
        public string? MarkDown { get; set; }
        public string? ProposerAddress { get; set; } = null;
        public string? ViewerAcceptedAddress { get; set; } = null;
    }
}