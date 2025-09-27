import { useState, useEffect } from "react";
import { ArrowLeft, Bookmark, Edit2, Trash2, Eye, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { Request } from "./RequestCard";
import { ConfirmModal } from "./ConfirmModal";

interface PostManagementPageProps {
  onBack: () => void;
  onSelectRequest: (request: Request) => void;
  allRequests: Request[];
  savedRequests: string[];
  onUnsaveRequest: (requestId: string) => void;
  onEditProfile: () => void;
  onUpdateRequest?: (requestId: string, updates: Partial<Request>) => void;
  onEditPost?: (request: Request) => void;
  onCreatePost?: () => void;
}

export function PostManagementPage({
  onBack,
  onSelectRequest,
  allRequests,
  savedRequests,
  onUnsaveRequest,
  onEditProfile,
  onUpdateRequest,
  onEditPost,
  onCreatePost,
}: PostManagementPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posted");
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [postToResolve, setPostToResolve] = useState<string | null>(null);

  // Filter requests posted by the current user
  const userPosts = allRequests.filter((request) => {
    // For now, we'll use the author field, but in a real app this would be based on user ID
    const userDisplayName =
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
    return request.author === userDisplayName;
  });

  // Get saved requests
  const userSavedPosts = allRequests.filter((request) =>
    savedRequests.includes(request.id)
  );

  const handleDeletePost = (requestId: string) => {
    // In a real app, this would delete from the database
    console.log("Delete post:", requestId);
    // For now, just show a confirmation
    if (window.confirm("Are you sure you want to delete this post?")) {
      // This would trigger a callback to remove from allRequests
      console.log("Post deleted");
    }
  };

  const handleEditPostClick = (request: Request) => {
    if (onEditPost) {
      onEditPost(request);
    } else {
      console.log("Edit post:", request.id);
      alert("Edit functionality would open here");
    }
  };

  const handleResolvePostClick = (requestId: string) => {
    setPostToResolve(requestId);
    setShowResolveModal(true);
  };

  const handleConfirmResolve = () => {
    if (postToResolve) {
      if (onUpdateRequest) {
        onUpdateRequest(postToResolve, { resolved: true });
      } else {
        console.log("Resolve post:", postToResolve);
        alert("Post marked as resolved");
      }
    }
    setPostToResolve(null);
  };

  const handleCancelResolve = () => {
    setPostToResolve(null);
    setShowResolveModal(false);
  };

  const PostCard = ({
    request,
    showActions = false,
  }: {
    request: Request;
    showActions?: boolean;
  }) => (
    <Card
      key={request.id}
      className={`mb-4 ${request.resolved ? "opacity-60" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{request.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{request.category}</Badge>
              {request.resolved && (
                <>
                  <span>•</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-300"
                  >
                    Resolved
                  </Badge>
                </>
              )}
              <span>•</span>
              <span>{request.location}</span>
              <span>•</span>
              <span>{request.timePosted}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4">
            {showActions ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPostClick(request)}
                  className="h-8 px-3 text-xs"
                  disabled={request.resolved}
                >
                  Edit
                </Button>
                <Button
                  variant={request.resolved ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handleResolvePostClick(request.id)}
                  className="h-8 px-3 text-xs"
                  disabled={request.resolved}
                >
                  {request.resolved ? "Resolved" : "Resolve"}
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnsaveRequest(request.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Bookmark className="h-4 w-4 fill-current" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectRequest(request)}
              className="h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {request.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {request.locationType}
            </Badge>
            {request.urgency && <span>Urgency: {request.urgency}</span>}
          </div>
          {request.pictures && request.pictures.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {request.pictures.length} photo
              {request.pictures.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-8 w-8 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-medium">My Posts</h1>
          </div>
        </div>
      </header>

      {/* Profile Section */}
      <div className="border-b bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-green-200">
                <User className="h-8 w-8 text-gray-600" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-medium text-lg mb-1">
                {user?.user_metadata?.full_name ||
                  user?.email?.split("@")[0] ||
                  "User"}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {user?.email || "user@example.com"}
              </p>
              <Button
                onClick={onEditProfile}
                className="bg-black hover:bg-gray-800 text-white rounded-full px-6 py-2 text-sm"
              >
                Edit profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Custom Toggle Design */}
          <div className="relative w-full mb-8">
            <div className="relative bg-gray-100 rounded-full p-1 flex">
              {/* Sliding white indicator */}
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
                  activeTab === "saved"
                    ? "translate-x-[calc(100%+8px)]"
                    : "translate-x-0"
                }`}
                style={{ left: "4px" }}
              />

              {/* Posted button */}
              <button
                onClick={() => setActiveTab("posted")}
                className={`relative z-10 flex-1 py-3 px-6 text-sm font-medium rounded-full transition-colors duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "posted"
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Posted ({userPosts.length})
              </button>

              {/* Saved button */}
              <button
                onClick={() => setActiveTab("saved")}
                className={`relative z-10 flex-1 py-3 px-6 text-sm font-medium rounded-full transition-colors duration-200 flex items-center justify-center gap-2 ${
                  activeTab === "saved"
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Bookmark className="h-4 w-4" />
                Saved ({userSavedPosts.length})
              </button>
            </div>
          </div>

          <TabsContent value="posted" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Posts You've Created</h2>
                <p className="text-sm text-muted-foreground">
                  {userPosts.length} post{userPosts.length !== 1 ? "s" : ""}
                </p>
              </div>

              {userPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      You haven't posted any requests yet.
                    </p>
                    <Button onClick={onCreatePost || onBack}>
                      Create Your First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((request) => (
                    <PostCard
                      key={request.id}
                      request={request}
                      showActions={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">Saved Posts</h2>
                <p className="text-sm text-muted-foreground">
                  {userSavedPosts.length} saved post
                  {userSavedPosts.length !== 1 ? "s" : ""}
                </p>
              </div>

              {userSavedPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      You haven't saved any posts yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Browse help requests and click the bookmark icon to save
                      them here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userSavedPosts.map((request) => (
                    <PostCard
                      key={request.id}
                      request={request}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Resolve Confirmation Modal */}
      <ConfirmModal
        isOpen={showResolveModal}
        onClose={handleCancelResolve}
        onConfirm={handleConfirmResolve}
        title="Resolve Post"
        description="Are you sure you want to mark this post as resolved? This action cannot be undone."
        confirmText="Resolve"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}
