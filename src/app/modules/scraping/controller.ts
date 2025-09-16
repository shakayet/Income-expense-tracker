/* eslint-disable no-console */
import app from '../../../app';
import { ProductSearchService } from '../services/ProductSearchService';

// In your route handler (Express example)
app.post('/search', async (req, res) => {
  try {
    const { productName, maxPrice } = req.body;
    
    if (!productName || !maxPrice) {
      return res.status(400).json({
        error: 'Missing required parameters: productName and maxPrice are required'
      });
    }

    const productSearchService = new ProductSearchService();
    const result = await productSearchService.searchProducts(productName, Number(maxPrice));

    res.json({
      success: true,
      data: {
        products: result.products,
        totalCount: result.totalCount,
        successfulSites: result.successfulSites,
        failedSites: result.failedSites
      }
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search products'
    });
  }
});