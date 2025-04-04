namespace API.Services
{
    public class SettledDto
    {
        public int RequestId { get; set; }
        public int EmployeeId { get; set; }
        public string? Comment { get; set; }
        public string SettledType { get; set; } = "Pending";
    }
}