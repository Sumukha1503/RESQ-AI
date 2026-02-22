import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { getPrioritizedDonations } from "../services/api";
import { toast } from "sonner";
import { Loader2, AlertCircle, Clock } from "lucide-react";

export function AdminPriorityDashboard() {
  const [prioritizedDonations, setPrioritizedDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchPrioritizedDonations();
    const intervalId = setInterval(fetchPrioritizedDonations, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const fetchPrioritizedDonations = async () => {
    try {
      setIsLoading(true);
      const data = await getPrioritizedDonations();
      setPrioritizedDonations(data);
      setLastUpdated(new Date());
      toast.success("Prioritized donations loaded successfully!");
    } catch (error) {
      toast.error("Failed to load prioritized donations.");
      console.error("Error fetching prioritized donations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityLevelClasses = (priorityLevel) => {
    switch (priorityLevel) {
      case "CRITICAL":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-black";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Priority Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Prioritized list of food donations for efficient rescue
          </p>
        </div>
        {lastUpdated && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}
      </div>

      {prioritizedDonations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">No prioritized donations found.</p>
            <p className="text-sm text-gray-500 mt-2">
              Ensure new listings are created and the priority algorithm is running.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prioritizedDonations.map((donation) => (
            <Card key={donation.id} className="relative">
              <div
                className={`absolute top-0 left-0 w-2 h-full rounded-l-lg`}
              ></div>
              <CardHeader className="pl-6">
                <CardTitle className="flex justify-between items-center">
                  <span>{donation.title || "Donation"}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityLevelClasses(donation.priorityLevel)}`}
                  >
                    {donation.priorityLevel}
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Priority Score: {donation.priorityScore?.toFixed(2)}
                </p>
              </CardHeader>
              <CardContent className="pl-6 text-sm text-muted-foreground">
                <p>Category: {donation.category}</p>
                <p>Quantity: {donation.quantity?.value} {donation.quantity?.unit}</p>
                <p>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</p>
                <p>Current Quality: {donation.currentQuality}%</p>
                <p>Time to Unsafe: {donation.timeToUnsafe}</p>
                {/* Add more details as needed */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}