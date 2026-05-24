export const formatDate = (date: Date) => {

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const formatted =
        `${String(date.getDate()).padStart(2, "0")} ` +
        `${months[date.getMonth()]} ` +
        `${date.getFullYear()} ` +
        `${String(date.getHours()).padStart(2, "0")}:` +
        `${String(date.getMinutes()).padStart(2, "0")}`;
    
    return formatted
}