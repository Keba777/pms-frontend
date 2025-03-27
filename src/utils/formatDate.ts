export const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    const dd = dateObj.getDate().toString().padStart(2, "0");
    const mm = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};