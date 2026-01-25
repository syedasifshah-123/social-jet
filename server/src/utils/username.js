export const generateUniqueUsername = (email) => {

    const base = email.split("@")[0];
    const keyword = Math.random().toString(36).substring(2, 6);
    const number = Math.floor(100 + Math.random() * 900);
    
    return `${base}_${keyword}_${number}`;
}