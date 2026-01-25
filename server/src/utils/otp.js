export const generateOtp = () => {

    const num = Math.floor(100000 + Math.random() * 900000);
    return num.toString();

};