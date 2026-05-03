export function getCoursesRoute(): string {
    return "/lms/courses";
}

export function getLegacyCoursesRoute(): string {
    return "/lms/materi";
}

export function getCourseRoute(courseId: string): string {
    return `/course/${courseId}`;
}

export function getLegacyCourseRoute(courseId: string): string {
    return `/lms/materi/${courseId}`;
}

export function getCourseLearnRoute(courseId: string, materiId: string): string {
    return `${getCourseRoute(courseId)}/learn/${materiId}`;
}

export function getLegacyCourseLearnRoute(courseId: string, materiId: string): string {
    return `${getLegacyCourseRoute(courseId)}/learn/${materiId}`;
}

export function getCourseQuizRoute(courseId: string, quizId: string): string {
    return `${getCourseRoute(courseId)}/quiz/${quizId}`;
}

export function getLegacyCourseQuizRoute(courseId: string, quizId: string): string {
    return `${getLegacyCourseRoute(courseId)}/quiz/${quizId}`;
}

export function getCourseCertificateRoute(courseId: string): string {
    return `${getCourseRoute(courseId)}/certificate`;
}

export function getLegacyCourseCertificateRoute(courseId: string): string {
    return `${getLegacyCourseRoute(courseId)}/certificate`;
}

export function isCoursePath(pathname: string, courseId: string): boolean {
    return pathname === getCourseRoute(courseId) || pathname === getLegacyCourseRoute(courseId);
}
