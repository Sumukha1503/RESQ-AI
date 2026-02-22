import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  MapPin, 
  Clock, 
  Package, 
  User, 
  Building2, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Truck,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { getPrioritizedDonations, updateFoodStatus } from "../../services/api";

export function PriorityDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, CRITICAL, HIGH, MEDIUM, LOW
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrioritizedDonations();
  }, []);

  const fetchPrioritizedDonations = async () => {
    try {
      setLoading(true);
      const response = await getPrioritizedDonations();
      if (response.success) {
        setDonations(response.data);
      }
    } catch (error) {
      toast.error("Failed to load prioritized donations");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      await updateFoodStatus(id, "claimed");
      toast.success("Food claimed successfully! Coordinate with the donor for pickup.");
      fetchPrioritizedDonations();
    } catch (error) {
      toast.error("Failed to claim food. Please try again.");
    }
  };

  // Filter donations based on selected filter
  const filteredDonations = donations.filter(donation => {
    if (filter === 'all') return true;
    return donation.priorityLevel === filter;
  });

  const getPriorityColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500 hover:bg-red-600";
      case "HIGH":
        return "bg-orange-500 hover:bg-orange-600";
      case "MEDIUM":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "LOW":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
      case "claimed":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400";
      case "completed":
        return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button variant="outline" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Priority Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Smart prioritization of food donations based on quality, urgency, and impact
        </p>
      </div>

      {/* Priority Legend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Priority Levels
          </CardTitle>
          <CardDescription>
            Donations are prioritized based on quality degradation, expiry time, and impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm">CRITICAL (80-100)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-sm">HIGH (60-79)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm">MEDIUM (40-59)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm">LOW (0-39)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Priorities
        </Button>
        <Button
          className={getPriorityColor('CRITICAL')}
          variant={filter === 'CRITICAL' ? 'default' : 'outline'}
          onClick={() => setFilter('CRITICAL')}
        >
          CRITICAL
        </Button>
        <Button
          className={getPriorityColor('HIGH')}
          variant={filter === 'HIGH' ? 'default' : 'outline'}
          onClick={() => setFilter('HIGH')}
        >
          HIGH
        </Button>
        <Button
          className={getPriorityColor('MEDIUM')}
          variant={filter === 'MEDIUM' ? 'default' : 'outline'}
          onClick={() => setFilter('MEDIUM')}
        >
          MEDIUM
        </Button>
        <Button
          className={getPriorityColor('LOW')}
          variant={filter === 'LOW' ? 'default' : 'outline'}
          onClick={() => setFilter('LOW')}
        >
          LOW
        </Button>
      </div>

      {/* Priority Donations */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Donations Found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "No food donations available at the moment. Check back soon!" 
                : `No ${filter} priority donations found.`}
            </p>
          </div>
        ) : (
          filteredDonations.map((donation) => (
            <Card key={donation._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{donation.title}</CardTitle>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getPriorityColor(donation.priorityLevel)}>
                      {donation.priorityLevel}
                    </Badge>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        donation.status
                      )}`}
                    >
                      {donation.status}
                    </span>
                  </div>
                </div>
                <CardDescription>{donation.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    <span>Score: {donation.priorityScore}</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>Quality: {donation.currentQuality}%</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Expiry: {donation.hoursUntilExpiry}h</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-red-500" />
                    <span>Unsafe: {donation.timeToUnsafe}</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  <span>By {donation.user?.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="h-4 w-4 mr-2" />
                  <span>
                    {typeof donation.quantity === 'object' 
                      ? `${donation.quantity.value} ${donation.quantity.unit}`
                      : donation.quantity}
                  </span>
                </div>
                {donation.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span 
                      className="cursor-pointer text-blue-600 hover:underline"
                      onClick={() => {
                        if (typeof donation.location === 'object') {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${donation.location.latitude},${donation.location.longitude}`, '_blank');
                        }
                      }}
                    >
                      {typeof donation.location === 'object' 
                        ? `${donation.location.latitude.toFixed(4)}, ${donation.location.longitude.toFixed(4)}`
                        : donation.location}
                    </span>
                  </div>
                )}
                {donation.pickupTime && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{donation.pickupTime}</span>
                  </div>
                )}
                {donation.status === "available" && (
                  <Button
                    className="w-full mt-2"
                    onClick={() => handleClaim(donation._id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Claim Donation
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}