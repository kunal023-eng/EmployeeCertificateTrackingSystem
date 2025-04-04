# Certification Management API

A .NET Core Web API for managing employee certifications, authentication, and email notifications.

## Tech Stack

- **.NET 9.0**: Latest version of .NET Core framework
- **C# 12**: Programming language
- **Entity Framework Core 9.0.2**: ORM for database operations
- **SQL Server**: Database
- **JWT Authentication**: For secure API access
- **MailKit 4.10.0**: For handling email operations
- **Swagger/OpenAPI**: API documentation and testing

## Project Structure

```
API/
├── Controllers/          # API endpoints
│   ├── AuthController.cs     # Authentication endpoints
│   ├── CertificationController.cs  # Certification management
│   └── EmailController.cs    # Email testing endpoints
│
├── Models/              # Data transfer objects and models
│   ├── EmployeeDto.cs      # Employee data transfer object
│   ├── LoginResponseDto.cs  # Login response model
│   └── EmailSettings.cs     # Email configuration model
│
├── Services/           # Business logic implementation
│   ├── AuthService.cs      # Authentication service
│   ├── EmailService.cs     # Email service
│   ├── IAuthService.cs     # Auth service interface
│   └── IEmailService.cs    # Email service interface
│
├── Entities/           # Database entities
│   ├── Employee.cs         # Employee entity
│   └── Certification.cs    # Certification entity
│
├── Data/              # Database context and configurations
│   └── ApplicationContext.cs  # EF Core DbContext
│
└── Program.cs         # Application startup and configuration
```

## Features

1. **Authentication**
   - JWT-based authentication
   - User registration and login
   - Role-based authorization

2. **Email Service**
   - Mailtrap integration for testing
   - HTML and plain text email support
   - Async email operations

3. **API Security**
   - JWT token validation
   - CORS policy configuration
   - Password hashing

## Configuration

### Database Connection
Configure the database connection in `appsettings.json`:
```json
"ConnectionStrings": {
  "dbcs": "Server=YOUR_SERVER;Database=CertificationDB;User Id=YOUR_USER;Password=YOUR_PASSWORD;Encrypt=False;"
}
```

### Email Settings (Mailtrap)
Configure email settings in `appsettings.json`:
```json
"EmailSettings": {
  "SmtpServer": "sandbox.smtp.mailtrap.io",
  "Port": 587,
  "Username": "YOUR_MAILTRAP_USERNAME",
  "Password": "YOUR_MAILTRAP_PASSWORD",
  "FromEmail": "noreply@certificationapp.com"
}
```

### JWT Settings
Configure JWT settings in `appsettings.json`:
```json
"AppSettings": {
  "Token": "YOUR_SECRET_KEY",
  "Audience": "YOUR_AUDIENCE",
  "Issuer": "YOUR_ISSUER"
}
```

## API Endpoints

### Authentication
- `POST /api/Auth/register` - Register new employee
- `POST /api/Auth/login` - Login and get JWT token

### Certifications
- `GET /api/Certification/GetAllCertifications` - Get all certifications
- `POST /api/Certification/AddCertification` - Add new certification (Manager only)

### Email
- `POST /api/Email/test` - Test email functionality

## Dependencies

```xml
<PackageReference Include="MailKit" Version="4.10.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.2" />
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="9.0.1" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.2" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="9.0.2" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.3.1" />
```

## Getting Started

1. Clone the repository
2. Update the connection string in `appsettings.json`
3. Run database migrations:
   ```bash
   dotnet ef database update
   ```
4. Run the application:
   ```bash
   dotnet run
   ```

## Development

- The API uses the repository pattern for data access
- Services are registered using dependency injection
- CORS is configured for frontend development
- Email service uses Mailtrap for testing

## Security Considerations

- Passwords are hashed using ASP.NET Core's password hasher
- JWT tokens are validated for issuer, audience, and expiration
- Database connection uses encrypted credentials
- Email credentials are stored in configuration
- CORS is configured for specific origins only

## Testing

1. **Authentication Testing**
   - Use the register endpoint to create a new user
   - Login to get JWT token
   - Use token in Authorization header for protected endpoints

2. **Email Testing**
   - Configure Mailtrap credentials
   - Use the test email endpoint
   - Check Mailtrap inbox for test emails

## Error Handling

- Global exception handling
- Detailed error messages in development
- Sanitized error messages in production
- Email service includes try-catch blocks
- Database operations are wrapped in transactions 