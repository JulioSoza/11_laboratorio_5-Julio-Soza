// Clase base para estudiantes y profesores con métodos de mensajería y gestión de cursos
class User {
    constructor({ name, surname, email, role }) {
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.role = role;
        this.courses = [];
        this.messages = [];
    }

    addCourse(course, level) {
        this.courses.push({ course, level });
    }

    removeCourse(course) {
        this.courses = this.courses.filter(c => c.course !== course);
    }

    editCourse(course, level) {
        const courseIndex = this.courses.findIndex(c => c.course === course);
        if (courseIndex !== -1) {
            this.courses[courseIndex].level = level;
        } else {
            this.courses.push({ course, level });
        }
    }

    sendMessage(to, message) {
        const from = this.email;
        const messageObject = { from, to: to.email, message };
        this.messages.push(messageObject);
        to.messages.push(messageObject);
        sendEmail(from, to.email, message);
    }

    showMessagesHistory() {
        this.messages.forEach(msg => {
            console.log(`${msg.from} -> ${msg.to}: ${msg.message}`);
        });
    }
}

function sendEmail(from, to, message) {
    console.log(`Email sent from ${from} to ${to}: ${message}`);
}

// Clase que extiende `User` y define el método de coincidencia de cursos
class ExtendedUser extends User {
    static match(teacher, student, courseName = null) {
        if (courseName) {
            const studentCourse = student.courses.find(c => c.course === courseName);
            const teacherCourse = teacher.courses.find(c => c.course === courseName);
            if (studentCourse && teacherCourse && teacherCourse.level >= studentCourse.level) {
                return { course: courseName, level: studentCourse.level };
            }
            return undefined;
        } else {
            return student.courses
                .filter(studentCourse => {
                    const teacherCourse = teacher.courses.find(c => c.course === studentCourse.course);
                    return teacherCourse && teacherCourse.level >= studentCourse.level;
                })
                .map(match => ({ course: match.course, level: match.level }));
        }
    }
}

// Clases específicas para definir roles de `Teacher` y `Student`
class Teacher extends ExtendedUser {
    constructor({ name, surname, email }) {
        super({ name, surname, email, role: 'teacher' });
    }
}

class Student extends ExtendedUser {
    constructor({ name, surname, email }) {
        super({ name, surname, email, role: 'student' });
    }
}

// Clase Tutoring que gestiona listas de estudiantes y profesores
class Tutoring {
    constructor() {
        this.students = [];
        this.teachers = [];
    }

    addStudent(name, surname, email) {
        const student = new Student({ name, surname, email });
        this.students.push(student);
    }

    addTeacher(name, surname, email) {
        const teacher = new Teacher({ name, surname, email });
        this.teachers.push(teacher);
    }

    getStudentByName(name, surname) {
        return this.students.find(student => student.name === name && student.surname === surname);
    }

    getTeacherByName(name, surname) {
        return this.teachers.find(teacher => teacher.name === name && teacher.surname === surname);
    }

    getStudentsForTeacher(teacher) {
        return this.students.filter(student => ExtendedUser.match(teacher, student).length > 0);
    }

    getTeacherForStudent(student) {
        return this.teachers.filter(teacher => ExtendedUser.match(teacher, student).length > 0);
    }
}

// Clase que extiende `Tutoring` y añade el método `sendMessages`
class ExtendedTutoring extends Tutoring {
    sendMessages(from, to, message) {
        to.forEach(recipient => {
            from.sendMessage(recipient, message);
        });
    }
}

// Pruebas
let tutoring = new ExtendedTutoring();
tutoring.addStudent('Rafael', 'Fife', 'rfife@rhyta.com');
tutoring.addStudent('Kelly', 'Estes', 'k_estes@dayrep.com');
tutoring.addTeacher('Paula', 'Thompkins', 'PaulaThompkins@jourrapide.com');

// Preparar destinatarios y enviar mensaje
let to = [
    tutoring.getStudentByName('Rafael', 'Fife'),
    tutoring.getStudentByName('Kelly', 'Estes')
];
tutoring.sendMessages(tutoring.getTeacherByName('Paula', 'Thompkins'), to, 'test message');

// Mostrar el historial de mensajes de cada destinatario
for (let user of to) {
    user.showMessagesHistory();
}
// Salida esperada:
// -> PaulaThompkins@jourrapide.com -> rfife@rhyta.com: test message
// -> PaulaThompkins@jourrapide.com -> k_estes@dayrep.com: test message
