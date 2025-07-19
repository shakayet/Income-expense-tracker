import Tesseract from 'tesseract.js';

export const extractDataFromImage = async (imagePath: string): Promise<{ amount?: number, category?: string }> => {
  const result = await Tesseract.recognize(imagePath, 'eng');
  const text = result.data.text.toLowerCase();
  console.log('OCR Raw Text:', text);

  const amountMatch = text.match(/(\d+(\.\d{1,2})?)/); // e.g., 25.50
  const categoryMatch = text.match(/(food|drink|transport|grocery|entertainment|bill|shopping|travel)/); // Add more as needed

  return {
    amount: amountMatch ? parseFloat(amountMatch[0]) : undefined,
    category: categoryMatch ? categoryMatch[0] : undefined,
  };
};
