
# 🏆 Employee Certificate Tracking & Reimbursement System

A comprehensive full-stack web application that simplifies the process of tracking employee certifications and managing reimbursement workflows. It enables employees to submit certifications and request reimbursements, managers to review and approve, and admins to monitor activity via detailed dashboards and analytics.

---


## 📌 Key Features

### 👨‍💼 Employee Portal
- Upload certificates with details (name, issuer, date, amount)
- Submit reimbursement requests
- View current and past submission statuses

### 🧑‍💼 Manager Portal
- View team’s requests
- Approve or reject reimbursements
- Leave remarks and track timelines

### 🛠️ Admin Dashboard
- View all user activities
- Generate reports (monthly, quarterly, annual)
- Visual analytics (bar charts, pie charts for approval trends)
- Manage user roles and permissions

### 🔔 Notifications
- Real-time status updates
- Email alerts on approval/rejection (optional)

---

## 🧰 Tech Stack

| Layer        | Technology        |
|--------------|-------------------|
| Frontend     | React.js, HTML5, CSS3, JavaScript |
| Backend      | .NET Core Web API |
| Database     | SQL Server        |
| Others       | REST API, Entity Framework Core, Axios, Chart.js |

---

## 🏗️ Project Structure

```
/EmployeeCertificateTrackingSystem
│
├── /client                # React Frontend
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   ├── /services
│   │   └── App.js
│   └── package.json
│
├── /server                # .NET Core Backend
│   ├── /Controllers
│   ├── /Models
│   ├── /Services
│   └── appsettings.json
│
└── README.md
```

---

## ⚙️ Installation Guide

### 🔧 Prerequisites
- Node.js + npm
- .NET 6 SDK
- SQL Server (local or hosted)

### 1. Clone the Repository
```bash
git clone https://github.com/kunal023-eng/EmployeeCertificateTrackingSystem.git
cd EmployeeCertificateTrackingSystem
```

---

### 2. Setup the Backend (.NET Core)

#### Open `server/` in Visual Studio
- Restore NuGet packages
- Update SQL Server connection string in `appsettings.json`
- Run the database migration:
```bash
dotnet ef database update
```

#### Run the backend
```bash
dotnet run
```
API will be hosted at: `https://localhost:5001/`

---

### 3. Setup the Frontend (React)

```bash
cd client
npm install
npm start
```

Frontend will be running at: `http://localhost:3000/`

---

## 📊 Screenshots

> _(Add screenshots or UI mockups here – login page, dashboard, approval screen, etc.)_

---

## 📈 Roadmap

- [ ] Add file preview for uploaded certificates
- [ ] Add download as PDF for reports
- [ ] Integrate email notifications
- [ ] Mobile-friendly responsive UI

---

## 🤝 Contribution Guidelines

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

**Kunal Singh**  
🔗 [GitHub]([https://github.com/kunal023-eng](https://github.com/kunal023-eng/EmployeeCertificateTrackingSystem.git))  
📫 Feel free to reach out for feedback, suggestions, or collaboration!
