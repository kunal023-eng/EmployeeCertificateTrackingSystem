using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class Certification
    {
        [Key]
        public int CertificationId { get; set; }
        public string Name { get; set; } = "";
        public string Provider { get; set; } = "";
        public string? Desc { get; set; }
        public decimal Amount { get; set; }

    }
}