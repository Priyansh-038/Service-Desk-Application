import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { useToast } from '../ui/use-toast';
import { Plus, X, AlertTriangle, Settings, Wifi, Key, Mail, Printer, HelpCircle, MessageSquare, Bug, ListTodo, Sparkles } from 'lucide-react';

const CreateTicketForm = ({ isOpen, onClose, onTicketCreated }) => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'low',
    type: 'issue'
  });

  const categories = [
    { value: 'Hardware', icon: Settings, color: 'from-blue-500 to-cyan-500' },
    { value: 'Software', icon: Settings, color: 'from-purple-500 to-indigo-500' },
    { value: 'Network', icon: Wifi, color: 'from-green-500 to-teal-500' },
    { value: 'Access Request', icon: Key, color: 'from-yellow-500 to-orange-500' },
    { value: 'Account Issues', icon: Settings, color: 'from-red-500 to-pink-500' },
    { value: 'Email', icon: Mail, color: 'from-indigo-500 to-purple-500' },
    { value: 'Printer', icon: Printer, color: 'from-gray-500 to-slate-500' },
    { value: 'Other', icon: HelpCircle, color: 'from-gray-400 to-gray-600' }
  ];

  const priorities = [
    { 
      value: 'low', 
      label: 'Low', 
      color: 'text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
      icon: '🟢',
      description: 'Minor issue, no urgency'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      color: 'text-yellow-600 bg-yellow-100 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800',
      icon: '🟡',
      description: 'Moderate impact on work'
    },
    { 
      value: 'high', 
      label: 'High', 
      color: 'text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800',
      icon: '🟠',
      description: 'Significant impact, needs attention'
    },
    { 
      value: 'critical', 
      label: 'Critical', 
      color: 'text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
      icon: '🔴',
      description: 'System down, blocking work'
    }
  ];

  const types = [
    { 
      value: 'issue', 
      label: 'Issue/Problem', 
      icon: Bug, 
      color: 'from-red-500 to-pink-500',
      description: 'Something is broken or not working'
    },
    { 
      value: 'request', 
      label: 'Service Request', 
      icon: ListTodo, 
      color: 'from-blue-500 to-indigo-500',
      description: 'Request for new service or access'
    },
    { 
      value: 'question', 
      label: 'Question', 
      icon: MessageSquare, 
      color: 'from-green-500 to-teal-500',
      description: 'Need help or guidance'
    }
  ];

  const generateTicketNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKT-${timestamp.slice(-6)}${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ticketData = {
        ...formData,
        ticketNumber: generateTicketNumber(),
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        userDepartment: userProfile?.department || 'Not specified',
        status: 'open',
        isPremium: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'tickets'), ticketData);

      toast({
        title: "🎉 Ticket created successfully!",
        description: `Your ticket ${ticketData.ticketNumber} has been submitted.`,
      });

      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'low',
        type: 'issue'
      });

      onTicketCreated();
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "❌ Error creating ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card className="shadow-2xl border-0 bg-white dark:bg-gray-900">
          <CardHeader className="relative pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute right-4 top-4 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create New Ticket
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  Submit a new service request or report an issue to our support team
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Brief, clear description of the issue or request"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="h-12 border-2 focus:border-blue-500 transition-all duration-200 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>

              {/* Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Request Type
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                    <SelectTrigger className="h-12 border-2 focus:border-blue-500 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-3 py-1">
                              <div className={`p-1 bg-gradient-to-r ${type.color} rounded-md`}>
                                <IconComponent className="h-3 w-3 text-white" />
                              </div>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Category *
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange('category', value)} required>
                    <SelectTrigger className="h-12 border-2 focus:border-blue-500 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => {
                        const IconComponent = category.icon;
                        return (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-3 py-1">
                              <div className={`p-1 bg-gradient-to-r ${category.color} rounded-md`}>
                                <IconComponent className="h-3 w-3 text-white" />
                              </div>
                              <span className="font-medium">{category.value}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Priority Level
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                  <SelectTrigger className="h-12 border-2 focus:border-blue-500 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center gap-3 py-1">
                          <span className="text-base">{priority.icon}</span>
                          <div>
                            <div className="font-medium">{priority.label}</div>
                            <div className="text-xs text-gray-500">{priority.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Detailed Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about the issue or request. Include steps to reproduce, error messages, and any relevant context..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  className="border-2 focus:border-blue-500 transition-all duration-200 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  💡 Tip: The more details you provide, the faster we can help you!
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="h-11 px-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="h-11 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTicketForm;