



export const medicalTypePrompt = (question: string, data: string) => {
    return `Please analyze gender_condition and age_condition of each object from this data: ${data}
    Find the most relevant object for answering this question: ${question}
    Please answer with this format: ***<medical_type of the matched object, if none return 'Please wait me for a while, I am contacting the technician'>***`;
}

export const contactTypePrompt = (question: string, data: string) => {
    return `Please analyze contact_type and contact_name of each object from this data: ${data}
    Find the most relevant object for answering this question: ${question}
    Please answer with this format: ***<contact_number of the matched object, if none return 'Please wait me for a while, I am checking the documents'>***`;
}
