## Access URLs

## 🌐 Access URLs

### **Student Portal**
- **URL:** `http://localhost:3000`
- **Login:** `http://localhost:3000/login`
- **Register:** `http://localhost:3000/register`

### **Tutor & Admin Portal**
- **URL:** `http://localhost:3000/protected`
- **Login:** `http://localhost:3000/protected` (Dual role login - tutor/admin)
- **Register:** `http://localhost:3000/protected-register`


## Credentials

### **Admin Account**
```
Email:    admin@qe.com
Password: 123456Lm#
```

##  Features Implemented

### **1. Authentication & Authorization** 
-  Role-based login (Admin, Tutor, Student)
-  Token-based authentication (JWT)
-  Fixed token storage conflicts (admin vs tutor vs student)
-  Token priority: Admin > Tutor > Student
-  Automatic token clearing on role switch
-  Protected routes with middleware

### **2. Admin Dashboard** 
-  **AdminDashboard.jsx** - Statistics overview
  - Total users, tutors, students, admins count
  - Total feedback count
  - Tutor-student ratio
  - Recent registrations (last 5 users)
  - Top rated tutors list
  - No refresh button (loads on dashboard tab)

### **3. User Management (Admin)** 
-  **ManageUsers.jsx** - Complete CRUD operations
  - **Read**: View all users with search & filter by role
  - **Create**: Add new user (Student/Tutor/Admin) with form validation
  - **Update**: Edit user details (name, phone, location, password)
  - **Delete**: Remove users with confirmation dialog
  - Prevent deleting the only admin
  - Real-time table updates
  - Summary statistics (Students/Tutors/Admins count)


### **4. Feedback & Ratings Management**
-  **ViewRatings.jsx** - Double view mode
  - **Summary Mode**: Browse tutor ratings overview (all roles)
  - **Detailed Mode**: Admin-only manage all feedback
  - Filter by subject, sort by rating/reviews/name
  - View complete feedback messages
  - Moderate/delete inappropriate reviews
  - Confirmation dialogs for actions

-  **Backend Endpoints:**
  - `GET /api/feedbacks` - Get all feedbacks (admin-only)
  - `DELETE /api/feedbacks/:id` - Delete feedback (admin/owner)
  - `POST /api/feedbacks` - Submit feedback (student)

### **5. Tutor - My Students** 
-  **MyStudents.jsx** - View tutorial students
  - List all students who gave feedback
  - Search by name/email
  - View student contact info
  - Summary: Total students, Active this month

### **6. View Student Progress** 
-  **Progress Modal** in MyStudents
  - Click "View Progress" on any student
  - See all topics tracked with completion %
  - Visual progress bars
  - Status: Completed ✓ or In Progress
  - Tutor notes for each topic
  - Summary stats: Total topics, Completed count, Average progress

-  **Backend Endpoints:**
  - `GET /api/progress/student/:studentId` - Fetch student progress
  - `GET /api/progress/tutor/:tutorId` - Fetch tutor's students' progress

