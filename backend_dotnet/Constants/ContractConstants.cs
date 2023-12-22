namespace SU_COIN_BACK_END.Constants.ContractConstants
{
    public static class ContractConstants
    {
        public static readonly string RegisterContractAddress = Environment.GetEnvironmentVariable("REACT_APP_PROJECT_REGISTER_ADDRESS") ?? "0xf31dDf7DfBEB775F9D387958c18a7423A06373d8";
        public static readonly string MaestroContractAddress = Environment.GetEnvironmentVariable("REACT_APP_MAESTRO_ADDRESS") ?? "0x7aFA304431a7103604051c2F14e7fB07A7F4F056";
    }
}