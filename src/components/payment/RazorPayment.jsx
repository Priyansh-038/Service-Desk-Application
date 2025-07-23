import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { CreditCard, Shield, Zap, Star, Clock, Sparkles, X } from 'lucide-react';

const RazorpayPayment = ({ ticket, onPaymentSuccess, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFrontendPayment, setShowFrontendPayment] = useState(false);
  const { toast } = useToast();

  const createOrder = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `order_${Date.now()}`,
      entity: "order",
      amount: 9900,
      amount_paid: 0,
      amount_due: 9900,
      currency: "INR",
      receipt: `receipt_${ticket.ticketNumber}`,
      status: "created",
      created_at: Math.floor(Date.now() / 1000)
    };
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const order = await createOrder();
      
      // Check if Razorpay is available (for real integration)
      if (typeof window.Razorpay !== 'undefined') {
        const options = {
          key: "rzp_test_9999999999",
          amount: order.amount,
          currency: order.currency,
          name: "Support Desk Premium",
          description: `Premium support for ticket ${ticket.ticketNumber}`,
          order_id: order.id,
          handler: function (response) {
            console.log('Payment Success:', response);
            
            toast({
              title: "Payment Successful!",
              description: `Payment ID: ${response.razorpay_payment_id}`,
            });
            
            onPaymentSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          },
          prefill: {
            name: ticket.userName,
            email: ticket.userEmail,
            contact: "9999999999"
          },
          notes: {
            ticket_id: ticket.id,
            ticket_number: ticket.ticketNumber,
            user_id: ticket.userId
          },
          theme: {
            color: "#3b82f6"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              toast({
                title: "Payment Cancelled",
                description: "You can try again anytime to upgrade to premium support.",
                variant: "destructive"
              });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Show frontend payment page instead
        setShowFrontendPayment(true);
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (showFrontendPayment) {
    return <FrontendPaymentPage ticket={ticket} onPaymentSuccess={onPaymentSuccess} onClose={onClose} onBack={() => setShowFrontendPayment(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-background via-background to-muted/20">
          <CardHeader className="text-center pb-4 relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Upgrade to Premium
            </CardTitle>
            <CardDescription className="text-sm">
              Get priority handling for your ticket
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-2">
            {/* Ticket Details */}
            <div className="bg-gradient-to-r from-muted/30 to-muted/50 p-4 rounded-lg border border-muted/50">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">#{ticket.ticketNumber}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{ticket.title}</p>
                </div>
                <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20 text-xs">
                  {ticket.priority}
                </Badge>
              </div>
            </div>

            {/* Premium Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Premium Benefits
              </h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200 text-xs">Priority Queue</p>
                    <p className="text-xs text-green-600 dark:text-green-300">Skip the line</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200 text-xs">24-Hour Guarantee</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">Fast response</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-center py-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">₹99</div>
              <div className="text-xs text-muted-foreground">One-time upgrade</div>
            </div>

            {/* Payment Button */}
            <div className="space-y-3">
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹99 Now
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onClose}
                className="w-full h-10 border-2 text-xs"
                disabled={isProcessing}
              >
                Maybe Later
              </Button>
            </div>

            {/* Security Note */}
            <div className="text-center py-2 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Shield className="h-3 w-3 text-green-500" />
                <span>🔒 Secure payment</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Frontend Payment Page Component
const FrontendPaymentPage = ({ ticket, onPaymentSuccess, onClose, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate successful payment
    const mockPaymentResponse = {
      paymentId: `pay_${Date.now()}`,
      orderId: `order_${Date.now()}`,
      signature: `sig_${Date.now()}`
    };

    toast({
      title: "🎉 Payment Successful!",
      description: `Payment ID: ${mockPaymentResponse.paymentId}`,
    });

    onPaymentSuccess(mockPaymentResponse);
    setIsProcessing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/g, '$1/').trim();
      if (formattedValue.length > 5) formattedValue = formattedValue.substr(0, 5);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 3) formattedValue = formattedValue.substr(0, 3);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Card className="shadow-2xl border-0 bg-white dark:bg-gray-900">
          <CardHeader className="text-center pb-4 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute left-2 top-2 h-8 w-8 p-0"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-2 top-2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Payment Details
            </CardTitle>
            <CardDescription className="text-sm">
              Complete your premium upgrade
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cardholder Name</label>
                <input
                  type="text"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full h-10 px-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Premium Upgrade</span>
                  <span className="font-semibold">₹99</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">₹99</span>
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  'Pay ₹99'
                )}
              </Button>

              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                🔒 This is a demo payment form. No actual payment will be processed.
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RazorpayPayment;