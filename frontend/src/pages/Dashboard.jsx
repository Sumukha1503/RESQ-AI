import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { getFoodListings, createFoodListing, getCurrentUser, updateFoodStatus } from "../services/api";
import { toast } from "sonner";
import { Plus, MapPin, Clock, Package, User } from "lucide-react";
import { Chatbot } from "../components/components/Chatbot";

export function Dashboard() {
  const [listings, setListings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "",
    location: "",
    pickupTime: "",
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createFoodListing(formData);
      toast.success("Food listing created successfully!");
      setFormData({ title: "", description: "", quantity: "", location: "", pickupTime: "" });
      setShowForm(false);
      fetchListings();
    } catch (error) {
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaim = async (id) => {
    try {
      await updateFoodStatus(id, "claimed");
      toast.success("Food claimed successfully!");
      fetchListings();
    } catch (error) {
      toast.error("Failed to claim food. Please try again.");
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === "donor" ? "Manage your food donations" : "Browse available food donations"}
          </p>
        </div>
        {user?.role === "donor" && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Listing
          </Button>
        )}
      </div>

      {showForm && user?.role === "donor" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Food Listing</CardTitle>
            <CardDescription>Share your surplus food with those who need it</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Fresh Vegetable Salad"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Describe the food items"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    placeholder="e.g., 10 servings"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <Input
                    id="pickupTime"
                    name="pickupTime"
                    placeholder="e.g., 2:00 PM - 4:00 PM"
                    value={formData.pickupTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., 123 Main St, City"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Listing"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Food Listings Yet</h3>
            <p className="text-muted-foreground">
              {user?.role === "donor"
                ? "Create your first listing to start sharing surplus food"
                : "Check back soon for available food donations"}
            </p>
          </div>
        ) : (
          listings.map((listing) => (
            <Card key={listing._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{listing.title}</CardTitle>
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
                  <span>By {listing.user?.name || "Anonymous"}</span>
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
                {user?.role !== "donor" && listing.status === "available" && (
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleClaim(listing._id)}
                  >
                    Claim This Donation
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Chatbot />
    </div>
  );
}
