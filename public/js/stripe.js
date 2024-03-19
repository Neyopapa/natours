import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { showAlert } from '/alerts';

export const bookTour = async (tourId) => {
  try {
    // 1) Get check out sessions from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);

    // // 2) Create checkout form + charge credit card
    if (session) {
      const stripe = await loadStripe(
        'pk_test_51OrfSLJkCABkjonMdKFs2kkdKvXnVWXowuzbuOS7UTMG9D7Boxfmw7qHQie7gNNLqAVmd4JVjCmQR5NeyGU2ZHUK00yu9fnLEW',
      );
      stripe.redirectToCheckout({
        sessionId: session.data.session.id,
      });
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
