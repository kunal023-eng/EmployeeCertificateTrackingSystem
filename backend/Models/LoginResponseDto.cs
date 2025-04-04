namespace API.Models
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int EmployeeId { get; set; }
    }
} 