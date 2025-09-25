import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { SearchBar } from "./components/SearchBar";
import { RequestCard, Request } from "./components/RequestCard";
import { RequestDetail } from "./components/RequestDetail";
import { PostPage } from "./components/PostPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ResetPasswordPage from "./components/ResetPasswordPage";
import { ProfilePage } from "./components/ProfilePage";

// Mock data for requests
const mockRequests: Request[] = [
  {
    id: "mock-1",
    title: "Need help moving furniture this weekend",
    description:
      "Looking for someone with a truck to help move a couch and dining table from my old apartment to my new place. Will provide pizza and drinks!\n\nI'm available Saturday or Sunday between 10 AM and 4 PM. The move is about 15 minutes between locations, and I can help with the heavy lifting. Just need someone with a pickup truck or van.\n\nPlease let me know if you're available and what you might charge for the help. Thanks!",
    category: "Moving",
    location: "Downtown District",
    locationType: "in-person",
    timePosted: "2 hours ago",
    author: "Sarah M.",
    urgency: "within 2-3 days",
    pictures: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3ZpbmclMjBmdXJuaXR1cmUlMjBjb3VjaHxlbnwxfHx8fDE3NTgzOTkxMTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  },
  {
    id: "mock-2",
    title: "Urgent: Cat stuck on apartment balcony",
    description:
      "My cat somehow got onto the balcony and can't get back in. I'm on the 3rd floor and need someone with a ladder or experience with animal rescue.\n\nThe cat seems scared and won't come to me. I think it might have jumped from a nearby tree. I don't have a ladder tall enough and I'm worried about the cat's safety.\n\nIf you have experience with animal rescue or have a tall ladder, please help! I can offer $50 for your assistance.",
    category: "Pet Care",
    location: "Riverside Area",
    locationType: "in-person",
    timePosted: "30 minutes ago",
    author: "Mike T.",
    urgency: "within today",
    pictures: [
      "https://images.unsplash.com/photo-1676920401273-d4d156e81226?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBiYWxjb255JTIwcmVzY3VlfGVufDF8fHx8MTc1ODM5OTExOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  },
  {
    id: "mock-3",
    title: "Tutoring needed for high school math",
    description:
      "My teenager is struggling with algebra and geometry. Looking for a patient tutor who can help 2-3 times per week after school.\n\nWe're looking for someone who can explain concepts clearly and help with homework. Sessions would be about 1-2 hours each, and we can work around your schedule.\n\nPayment is negotiable based on experience. References preferred but not required.",
    category: "Education",
    location: "Online/Remote",
    locationType: "online",
    timePosted: "1 day ago",
    author: "Jennifer L.",
    urgency: "no rush - whenever convenient",
  },
  {
    id: "mock-4",
    title: "Garden cleanup before winter",
    description:
      "Need help trimming bushes, raking leaves, and preparing my garden for winter. Have all the tools, just need extra hands!\n\nThe yard is medium-sized and should take about 3-4 hours with two people working. I can provide lunch and drinks, plus $20/hour for the help.\n\nPreferably looking for help this weekend before the weather gets too cold.",
    category: "Yard Work",
    location: "Green Valley",
    locationType: "in-person",
    timePosted: "4 hours ago",
    author: "Robert K.",
    urgency: "within a week",
    pictures: [
      "https://images.unsplash.com/photo-1653268393199-a799c7863354?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjB5YXJkJTIwY2xlYW51cHxlbnwxfHx8fDE3NTgzOTkxMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  },
  {
    id: "mock-5",
    title: "Computer repair - won't start up",
    description:
      "My laptop suddenly stopped working and won't turn on. Need someone tech-savvy to diagnose and hopefully fix the issue.\n\nIt was working fine yesterday, but this morning it won't respond to the power button at all. I've tried different outlets and checked the power cord.\n\nI have important work files on it that I really need to recover. Can pay for diagnostic and repair services.",
    category: "Tech Support",
    location: "Online/Remote",
    locationType: "online",
    timePosted: "6 hours ago",
    author: "Amy Chen",
    urgency: "within 2-3 days",
    pictures: [
      "https://images.unsplash.com/photo-1643691291828-648e708e16c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9rZW4lMjBsYXB0b3AlMjBjb21wdXRlcnxlbnwxfHx8fDE3NTgzOTkxMjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  },
  {
    id: "mock-6",
    title: "Ride needed to medical appointment",
    description:
      "I have a doctor's appointment tomorrow at 2 PM but my car is in the shop. Need a ride to and from the medical center.\n\nThe appointment is at Downtown Medical Center and should take about an hour. I live in the Medical District, so it's not too far.\n\nI can cover gas money and really appreciate any help. This is an important follow-up appointment that I can't reschedule.",
    category: "Transportation",
    location: "Medical District",
    locationType: "in-person",
    timePosted: "12 hours ago",
    author: "Eleanor W.",
    urgency: "within today",
  },
];

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [allRequests, setAllRequests] = useState(mockRequests);
  const [filteredRequests, setFilteredRequests] = useState(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showPostPage, setShowPostPage] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // Additional safety timeout in case auth loading gets stuck
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppReady(true);
    }, 3000); // 3 second safety timeout

    if (!loading) {
      clearTimeout(timeout);
      setAppReady(true);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredRequests(allRequests);
    } else {
      const filtered = allRequests.filter(
        (request) =>
          request.title.toLowerCase().includes(query.toLowerCase()) ||
          request.description.toLowerCase().includes(query.toLowerCase()) ||
          request.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredRequests(filtered);
    }
  };

  const handleSelectRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowPostPage(false);
    // Scroll to top when opening request detail page
    window.scrollTo(0, 0);
  };

  const handleBackToRequests = () => {
    setSelectedRequest(null);
    setShowPostPage(false);
    setShowProfilePage(false);
    setSearchQuery("");
    setFilteredRequests(allRequests);
  };

  const handleAuthenticationComplete = () => {
    // Auth state is now managed by AuthProvider
    console.log("Authentication completed");
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePostClick = () => {
    setShowPostPage(true);
    setSelectedRequest(null);
    setShowProfilePage(false);
    window.scrollTo(0, 0);
  };

  const handleProfileClick = () => {
    setShowProfilePage(true);
    setSelectedRequest(null);
    setShowPostPage(false);
    window.scrollTo(0, 0);
  };

  const handlePostSubmit = (newRequest: Request) => {
    const updatedRequests = [newRequest, ...allRequests];
    setAllRequests(updatedRequests);
    setFilteredRequests(updatedRequests);
    setShowPostPage(false);
    setSearchQuery("");
    window.scrollTo(0, 0);
  };

  // Reset password route (simple no-router handling)
  if (window.location.pathname === "/reset-password") {
    return <ResetPasswordPage />;
  }

  // Show loading state while checking auth, but with safety timeout
  if (loading && !appReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          <p className="text-xs text-gray-400 mt-2">
            If this takes too long, try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // Show profile page
  if (showProfilePage) {
    return <ProfilePage onBack={handleBackToRequests} />;
  }

  // Show post page
  if (showPostPage) {
    return (
      <PostPage onBack={handleBackToRequests} onSubmit={handlePostSubmit} />
    );
  }

  // Show request detail page if a request is selected
  if (selectedRequest) {
    return (
      <RequestDetail request={selectedRequest} onBack={handleBackToRequests} />
    );
  }

  // Show main landing page
  return (
    <div className="min-h-screen bg-background">
      <Header
        onLogoClick={handleBackToRequests}
        isAuthenticated={!!user}
        onAuthenticationComplete={handleAuthenticationComplete}
        onLogout={handleLogout}
        onPostClick={handlePostClick}
        onProfileClick={handleProfileClick}
      />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="mb-4 max-w-3xl mx-auto text-6xl">
            Connect with your community and get the help you need
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of neighbors helping each other with everyday tasks,
            emergencies, and building stronger communities together.
          </p>
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Requests Section */}
      <section className="py-8 px-4 bg-black">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white">Recent Help Requests</h2>
            <p className="text-gray-400">
              {filteredRequests.length} request
              {filteredRequests.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onSelect={handleSelectRequest}
              />
            ))}
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                No requests found matching your search. Try different keywords.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 py-8 px-4 border-t bg-muted/30">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>
            © 2024 HelperHub. Building stronger communities, one favor at a
            time.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
