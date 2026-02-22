import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getFoodListings, updateFoodStatus, getCurrentUser } from "../services/api";
import { toast } from "sonner";
import { MapPin, Clock, Package, User, Heart, CheckCircle2, TrendingUp, Activity, Award } from "lucide-react";
import { Chatbot } from "../components/components/Chatbot";

export function VolunteerDashboard() {
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // available, helping, completed

  const user = getCurrentUser();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await getFoodListings();
      setListings(data);
    } catch (error) {
      toast.error("Failed to load food listings");
    }
  };

  const handleClaim = async (id) => {
    try {
      await updateFoodStatus(id, "claimed");
      toast.success("Donation claimed! Coordinate with the donor for pickup.");
      fetchListings();
    } catch (error) {
      toast.error("Failed to claim donation.");
    }
  };

  const handleComplete = async (id) => {
    try {
      await updateFoodStatus(id, "completed");
      toast.success("Great job! Donation completed successfully!");
      fetchListings();
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  // Calculate volunteer-specific stats
  const stats = {
    available: listings.filter(l => l.status === 'available').length,
    helping: listings.filter(l => l.status === 'claimed').length,
    completed: listings.filter(l => l.status === 'completed').length,
    impact: listings.filter(l => l.status === 'completed').length * 10, // Estimated meals
  };

  // Filter listings based on active tab
  const filteredListings = listings.filter(listing => {
    if (activeTab === 'available') return listing.status === 'available';
    if (activeTab === 'helping') return listing.status === 'claimed';
    if (activeTab === 'completed') return listing.status === 'completed';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
      case "claimed":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400";
      case "completed":
        return "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-400";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-8 w-8 text-primary fill-primary" />
          <h1 className="text-3xl font-bold">Volunteer Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Make a difference by helping distribute food to those in need
        </p>
      </div>

      {/* Volunteer Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Need Help</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">Available donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Helping Now</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.helping}</div>
            <p className="text-xs text-muted-foreground">Active pickups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Successful deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Impact</CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.impact}</div>
            <p className="text-xs text-muted-foreground">Estimated meals saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'available' ? 'default' : 'outline'}
          onClick={() => setActiveTab('available')}
        >
          Available ({stats.available})
        </Button>
        <Button
          variant={activeTab === 'helping' ? 'default' : 'outline'}
          onClick={() => setActiveTab('helping')}
        >
          Helping ({stats.helping})
        </Button>
        <Button
          variant={activeTab === 'completed' ? 'default' : 'outline'}
          onClick={() => setActiveTab('completed')}
        >
          Completed ({stats.completed})
        </Button>
      </div>

      {/* Food Listings */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'available' && "No Donations Available"}
              {activeTab === 'helping' && "No Active Pickups"}
              {activeTab === 'completed' && "No Completed Donations Yet"}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'available' && "Check back soon for new food donation opportunities!"}
              {activeTab === 'helping' && "Claim a donation to start helping!"}
              {activeTab === 'completed' && "Complete your first donation to see it here!"}
            </p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <Card key={listing._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      listing.status
                    )}`}
                  >
                    {listing.status}
                  </span>
                </div>
                <CardDescription>{listing.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  <span>Donor: {listing.user?.name || "Anonymous"}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="h-4 w-4 mr-2" />
                  <span>
                    {typeof listing.quantity === 'object'
                      ? `${listing.quantity.value} ${listing.quantity.unit}`
                      : listing.quantity}
                  </span>
                </div>
                {listing.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span
                      className="cursor-pointer text-blue-600 hover:underline"
                      onClick={() => {
                        if (typeof listing.location === 'object') {
                          window.open(`https://www.google.com/maps/search/?api=1&query=${listing.location.latitude},${listing.location.longitude}`, '_blank');
                        }
                      }}
                    >
                      {typeof listing.location === 'object'
                        ? `${listing.location.latitude.toFixed(4)}, ${listing.location.longitude.toFixed(4)}`
                        : listing.location}
                    </span>
                  </div>
                )}
                {listing.pickupTime && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{listing.pickupTime}</span>
                  </div>
                )}

                {listing.status === "available" && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleClaim(listing._id)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Help with This
                  </Button>
                )}

                {listing.status === "claimed" && (
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => handleComplete(listing._id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}

                {listing.status === "completed" && (
                  <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm text-center text-purple-700 dark:text-purple-300 font-medium">
                      ✨ Thank you for making a difference!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Volunteer Impact Message */}
      {stats.completed > 0 && (
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-12 w-12 mx-auto text-purple-600 mb-3" />
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                Amazing Impact!
              </h3>
              <p className="text-purple-700 dark:text-purple-300">
                You've helped save approximately <span className="font-bold text-2xl">{stats.impact}</span> meals from going to waste.
                Thank you for being a ResQ AI hero! 🎉
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Chatbot />
    </div>
  );
}
