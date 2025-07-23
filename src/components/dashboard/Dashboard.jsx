import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import Header from './Header';
import TicketsList from './TicketsList';
import CreateTicketForm from './CreateTicketForm';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, TicketIcon, Clock, CheckCircle, AlertCircle, TrendingUp, Activity, Users, Award } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    progress: 0,
    resolved: 0,
    closed: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let q;
        
        if (userProfile?.role === 'admin') {
        q = query(collection(db, 'tickets'));
        } else {
          q = query(
            collection(db, 'tickets'),
            where('userId', '==', currentUser.uid)
          );
        }

        const querySnapshot = await getDocs(q);
        const tickets = [];
        querySnapshot.forEach((doc) => {
          tickets.push(doc.data());
        });

        const newStats = {
          total: tickets.length,
          open: tickets.filter(t => t.status === 'open').length,
          progress: tickets.filter(t => t.status === 'progress').length,
          resolved: tickets.filter(t => t.status === 'resolved').length,
          closed: tickets.filter(t => t.status === 'closed').length
        };

        setStats(newStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (currentUser && userProfile) {
      fetchStats();
    }
  }, [currentUser, userProfile, refreshTrigger]);

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const statCards = [
    {
      title: 'Total Tickets',
      value: stats.total,
      icon: TicketIcon,
      color: 'text-blue-600',
      bgColor: 'from-blue-500/10 to-blue-600/10',
      borderColor: 'border-blue-200 dark:border-blue-800',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Open',
      value: stats.open,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'from-orange-500/10 to-red-500/10',
      borderColor: 'border-orange-200 dark:border-orange-800',
      change: '+5%',
      changeType: 'neutral'
    },
    {
      title: 'In Progress',
      value: stats.progress,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'from-yellow-500/10 to-amber-500/10',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      change: '-3%',
      changeType: 'negative'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-200 dark:border-green-800',
      change: '+18%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {userProfile?.role === 'admin' ? '👑 Admin Dashboard' : '🎯 My Tickets'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {userProfile?.role === 'admin' 
                  ? 'Manage and track all service desk tickets with ease' 
                  : 'View and manage your service requests efficiently'}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  <Activity className="h-3 w-3 mr-1" />
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Badge>
                {userProfile?.department && (
                  <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                    <Users className="h-3 w-3 mr-1" />
                    {userProfile.department}
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)} 
              className="mt-6 sm:mt-0 h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-white"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Ticket
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className={`${stat.borderColor} border-2 bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 shadow-sm`}>
                    <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="flex items-center text-xs">
                    <TrendingUp className={`h-3 w-3 mr-1 ${
                      stat.changeType === 'positive' ? 'text-green-500' : 
                      stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={`font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 ml-1">from last week</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Welcome Card for New Users */}
        {stats.total === 0 && (
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                    🎉 Welcome to Service Desk!
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300 text-base mt-1">
                    Get started by creating your first ticket. Our expert team is here to help with any issues or requests you may have.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket
                </Button>
                <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <p className="font-medium">💡 Quick Tips:</p>
                  <ul className="text-xs space-y-0.5 text-blue-600/80 dark:text-blue-400/80">
                    <li>• Be specific about your issue</li>
                    <li>• Include relevant details and screenshots</li>
                    <li>• Set the appropriate priority level</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <TicketsList refreshTrigger={refreshTrigger} />
        </div>
      </main>

      <CreateTicketForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};

export default Dashboard;