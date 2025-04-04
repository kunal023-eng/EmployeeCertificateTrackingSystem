using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class CertificationRequest
    {
        [Key]
        public int RequestId { get; set; }
        public int EmployeeId { get; set; }
        public int CertificationId { get; set; }
        public List<string> DocumentURLs {get; set;}= [];
        public int? ManagerId { get; set; }
        public string ManagerSettledStatus { get; set; } = "Pending";
        public string? ManagerComment { get; set; }
        public int? HrId { get; set; }
        public string HrSettledStatus { get; set; } = "Pending";
        public string? HrComment { get; set; }
        public DateTime RequestDate { get; set; } = DateTime.Now;
        public DateTime? ManagerSettledDate { get; set; }
        public DateTime? HrSettledDate { get; set; }
        public int Attempts { get; set; } = 1;

        public Employee? Employee { get; set; }
        public Employee? Manager { get; set; }
        public Employee? Hr { get; set; }
        public Certification? Certification { get; set; }
    }
}