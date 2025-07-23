import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import RazorpayPayment from '../payment/RazorPayment';
import { Clock, User, AlertCircle, CheckCircle, XCircle, RefreshCw, Search, Filter, Zap, Crown, Calendar } from 'lucide-react';

const TicketsList = ({ refreshTrigger }) => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketForPayment, setSelectedTicketForPayment] = useState(null);

  const statusConfig = {
    open: { 
      icon: AlertCircle, 
      color: 'text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800', 
      label: 'Open',
      bgColor: 'bg-gradient-to-r from-orange-500/10 to-red-500/10'
    },
    progress: { 
      icon: RefreshCw, 
      color: 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800', 
      label: 'In Progress',
      bgColor: 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'
    },
    resolved: { 
      icon: CheckCircle, 
      color: 'text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800', 
      label: 'Resolved',
      bgColor: 'bg-gradient-to-r from-green-500/10 to-emerald-500/10'
    },
    closed: { 
      icon: XCircle, 
      color: 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-700/20 dark:border-gray-600', 
      label: 'Closed',
      bgColor: 'bg-gradient-to-r from-gray-500/10 to-slate-500/10'
    }
  };

  const priorityConfig = {
    low: { 
      color: 'text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800', 
      label: 'Low',
      icon: '🟢'
    },
    medium: { 
      color: 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800', 
      label: 'Medium',
      icon: '🟡'
    },
    high: { 
      color: 'text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800', 
      label: 'High',
      icon: '🟠'
    },
    critical: { 
      color: 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800', 
      label: 'Critical',
      icon: '🔴'
    }
  };

  useEffect(() => {
    let q;
    
    if (userProfile?.role === 'admin') {
      q = query(
        collection(db, 'tickets'),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        collection(db, 'tickets'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ticketsData = [];
      querySnapshot.forEach((doc) => {
        ticketsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setTickets(ticketsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userProfile, refreshTrigger]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      await updateDoc(doc(db, 'tickets', selectedTicketForPayment.id), {
        isPremium: true,
        paymentId: paymentData.paymentId,
        upgradedAt: new Date()
      });
      
      toast({
        title: "🎉 Premium Upgrade Successful!",
        description: "Your ticket has been upgraded to premium support.",
      });
      
      setSelectedTicketForPayment(null);
    } catch (error) {
      console.error('Error updating ticket to premium:', error);
      toast({
        title: "Error",
        description: "Failed to upgrade ticket to premium",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">📋 Support Tickets</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'} found
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 w-full sm:w-64 bg-white dark:bg-gray-800 border-2 focus:border-blue-500 rounded-lg"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10 bg-white dark:bg-gray-800 border-2 rounded-lg">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">🟠 Open</SelectItem>
              <SelectItem value="progress">🔵 In Progress</SelectItem>
              <SelectItem value="resolved">🟢 Resolved</SelectItem>
              <SelectItem value="closed">⚪ Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No tickets found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {filter === 'all' 
                ? "You haven't created any tickets yet. Click the 'Create New Ticket' button to get started!" 
                : `No tickets with status "${filter}" found. Try adjusting your filters.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => {
            const StatusIcon = statusConfig[ticket.status]?.icon || AlertCircle;
            const statusInfo = statusConfig[ticket.status];
            const priorityInfo = priorityConfig[ticket.priority];
            
            return (
              <Card key={ticket.id} className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4 ${
                ticket.isPremium 
                  ? 'border-l-yellow-400 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10' 
                  : statusInfo?.bgColor + ' border-l-gray-200 dark:border-l-gray-700'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        {ticket.isPremium && (
                          <div className="p-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-sm">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg text-gray-900 dark:text-white leading-tight">
                            {ticket.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-mono bg-gray-100 dark:bg-gray-800">
                              {ticket.ticketNumber}
                            </Badge>
                            {ticket.isPremium && (
                              <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-sm">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`text-xs border-2 ${priorityInfo?.color}`}>
                        <span className="mr-1">{priorityInfo?.icon}</span>
                        {priorityInfo?.label}
                      </Badge>
                      <Badge className={`text-xs border-2 ${statusInfo?.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo?.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="font-medium">Category:</span>
                        <span>{ticket.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="font-medium">Type:</span>
                        <span className="capitalize">{ticket.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                      {userProfile?.role === 'admin' && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{ticket.userName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        {userProfile?.role === 'admin' && (
                          <Select 
                            value={ticket.status} 
                            onValueChange={(value) => handleStatusUpdate(ticket.id, value)}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">🟠 Open</SelectItem>
                              <SelectItem value="progress">🔵 In Progress</SelectItem>
                              <SelectItem value="resolved">🟢 Resolved</SelectItem>
                              <SelectItem value="closed">⚪ Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      
                      {!ticket.isPremium && ticket.userId === currentUser?.uid && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedTicketForPayment(ticket)}
                          className="h-9 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Upgrade to Premium ₹99
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedTicketForPayment && (
        <RazorpayPayment
          ticket={selectedTicketForPayment}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setSelectedTicketForPayment(null)}
        />
      )}
    </div>
  );
};

export default TicketsList;