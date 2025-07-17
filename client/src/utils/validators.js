export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validatePhone = (phone) => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
    return phoneRegex.test(phone)
  }
  
  export const validateRequired = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== ''
  }
  
  export const validateMinLength = (value, minLength) => {
    return value && value.length >= minLength
  }
  
  export const validateMaxLength = (value, maxLength) => {
    return !value || value.length <= maxLength
  }
  
  export const validateCreditCard = (cardNumber) => {
    // Basic Luhn algorithm validation
    const num = cardNumber.replace(/\s/g, '')
    if (!/^\d+$/.test(num)) return false
    
    let sum = 0
    let isEven = false
    
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }
  
  export const validateZipCode = (zipCode) => {
    const zipRegex = /^\d{5}(-\d{4})?$/
    return zipRegex.test(zipCode)
  }
  