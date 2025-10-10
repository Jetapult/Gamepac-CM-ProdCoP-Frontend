import { useState } from "react"
import { Copy, Link, Mail, MessageSquare, Share2, Users } from "lucide-react"
import Layout from "../Layout"
import Placeholder from "../../../assets/placeholder.svg"

export default function Collaboration() {
  const [shareLink, setShareLink] = useState("https://gdd-assistant.app/share/project-1?token=abc123")
  const [selectedProject, setSelectedProject] = useState("project-1")
  const [activeTab, setActiveTab] = useState("sharing")

  const projects = [
    { id: "project-1", title: "Space Explorer RPG" },
    { id: "project-2", title: "Puzzle Adventure" },
    { id: "project-3", title: "Strategy Conquest" },
  ]

  const collaborators = [
    {
      id: "user1",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "Designer",
      avatar: Placeholder,
    },
    {
      id: "user2",
      name: "Sam Taylor",
      email: "sam@example.com",
      role: "Product Manager",
      avatar: Placeholder,
    },
    {
      id: "user3",
      name: "Jamie Smith",
      email: "jamie@example.com",
      role: "Developer",
      avatar: Placeholder,
    },
  ]

  const comments = [
    {
      id: "comment1",
      user: {
        name: "Alex Johnson",
        avatar: Placeholder,
      },
      section: "Game Mechanics",
      text: "I think we should simplify the resource gathering mechanics to make it more accessible to casual players.",
      timestamp: "2 days ago",
      replies: [
        {
          id: "reply1",
          user: {
            name: "Sam Taylor",
            avatar: Placeholder,
          },
          text: "Good point. Let's discuss this in our next meeting.",
          timestamp: "1 day ago",
        },
      ],
    },
    {
      id: "comment2",
      user: {
        name: "Jamie Smith",
        avatar: Placeholder,
      },
      section: "Technical Specs",
      text: "We need to consider the performance implications of the procedural generation system on lower-end devices.",
      timestamp: "3 days ago",
      replies: [],
    },
  ]

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Collaboration</h1>
          <p className="text-muted-foreground">Share your game design documents and collaborate with your team</p>
        </div>

        <div className="mb-6">
          <div className="inline-flex border rounded-md overflow-hidden bg-white p-2">
            <button 
              className={`px-3 py-1 rounded-md mr-2 ${activeTab === "sharing" ? "bg-gray-200" : "hover:bg-gray-200"}`}
              onClick={() => setActiveTab("sharing")}
            >
              Sharing
            </button>
            <button 
              className={`px-3 py-1 rounded-md mr-2 ${activeTab === "team" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              onClick={() => setActiveTab("team")}
            >
              Team Members
            </button>
            <button 
              className={`px-3 py-1 rounded-md mr-2 ${activeTab === "comments" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              onClick={() => setActiveTab("comments")}
            >
              Comments
            </button>
          </div>
        </div>

        {activeTab === "sharing" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded-lg shadow-sm bg-white">
              <div className="p-6 pb-2">
                <h3 className="text-xl font-semibold">Share Project</h3>
                <p className="text-sm text-muted-foreground">Generate a shareable link to your game design document</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="project-select" className="block text-sm font-medium">Select Project</label>
                  <select 
                    id="project-select" 
                    className="w-full p-2 border rounded-md" 
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">Access Permissions</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label htmlFor="view-access" className="text-sm font-medium">
                          View Access
                        </label>
                        <p className="text-xs text-muted-foreground">Allow others to view your GDD</p>
                      </div>
                      <div className="relative inline-block w-10 h-5">
                        <input 
                          type="checkbox" 
                          id="view-access" 
                          className="opacity-0 w-0 h-0" 
                          defaultChecked 
                        />
                        <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all before:duration-300 checked:bg-primary checked:before:translate-x-5"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label htmlFor="edit-access" className="text-sm font-medium">
                          Edit Access
                        </label>
                        <p className="text-xs text-muted-foreground">Allow others to edit your GDD</p>
                      </div>
                      <div className="relative inline-block w-10 h-5">
                        <input 
                          type="checkbox" 
                          id="edit-access" 
                          className="opacity-0 w-0 h-0" 
                        />
                        <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all before:duration-300 checked:bg-primary checked:before:translate-x-5"></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label htmlFor="comment-access" className="text-sm font-medium">
                          Comment Access
                        </label>
                        <p className="text-xs text-muted-foreground">Allow others to comment on your GDD</p>
                      </div>
                      <div className="relative inline-block w-10 h-5">
                        <input 
                          type="checkbox" 
                          id="comment-access" 
                          className="opacity-0 w-0 h-0" 
                          defaultChecked 
                        />
                        <span className="absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-all before:duration-300 checked:bg-primary checked:before:translate-x-5"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-2 border-t flex flex-col space-y-4">
                <div className="flex w-full space-x-2">
                  <input 
                    type="text"
                    className="w-full p-2 border rounded-md" 
                    value={shareLink} 
                    readOnly 
                  />
                  <button 
                    className="p-2 border rounded-md hover:bg-gray-100" 
                    onClick={copyShareLink}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex w-full space-x-2">
                  <button className="flex-1 flex items-center justify-center py-2 px-4 bg-black text-white rounded-md hover:bg-primary/90">
                    <Link className="mr-2 h-4 w-4" />
                    Generate Link
                  </button>
                  <button className="flex-1 flex items-center justify-center py-2 px-4 border rounded-md hover:bg-gray-50">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Invite
                  </button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg shadow-sm bg-white">
              <div className="p-6 pb-2">
                <h3 className="text-xl font-semibold">AI-Generated Summaries</h3>
                <p className="text-sm text-muted-foreground">Customized summaries of your GDD for different team roles</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Select Role for Summary</label>
                  <select className="w-full p-2 border rounded-md" defaultValue="designer">
                    <option value="designer">Game Designer</option>
                    <option value="pm">Product Manager</option>
                    <option value="developer">Developer</option>
                    <option value="artist">Artist</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div className="rounded-md border p-4 bg-muted/50">
                  <h3 className="text-sm font-medium mb-2">Summary for Game Designer</h3>
                  <p className="text-sm text-muted-foreground">
                    Space Explorer RPG is a sci-fi RPG focusing on exploration, resource management, and character
                    progression. The core gameplay loop involves exploring planets, gathering resources, and upgrading
                    equipment. Key design challenges include balancing the resource economy and ensuring the procedural
                    generation creates interesting environments.
                  </p>
                </div>

                <button className="w-full flex items-center justify-center py-2 px-4 border rounded-md hover:bg-gray-50">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "team" && (
          <div className="border rounded-lg shadow-sm">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Team Members</h3>
              <p className="text-sm text-muted-foreground">Manage team members and their access to your projects</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Current Collaborators</h3>
                  <button className="py-1 px-3 text-sm bg-primary text-white rounded-md hover:bg-primary/90 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Invite New Member
                  </button>
                </div>

                <div className="space-y-4">
                  {collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center justify-between p-3 rounded-md border">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {collaborator.avatar ? (
                            <img src={collaborator.avatar} alt={collaborator.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-lg font-medium">{collaborator.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{collaborator.name}</p>
                          <p className="text-sm text-muted-foreground">{collaborator.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select className="p-1 border rounded-md w-[140px]" defaultValue={collaborator.role.toLowerCase()}>
                          <option value="designer">Designer</option>
                          <option value="product manager">Product Manager</option>
                          <option value="developer">Developer</option>
                          <option value="artist">Artist</option>
                        </select>
                        <button className="py-1 px-3 text-sm text-gray-600 rounded-md hover:bg-gray-100">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "comments" && (
          <div className="border rounded-lg shadow-sm">
            <div className="p-6 pb-2">
              <h3 className="text-xl font-semibold">Comments & Feedback</h3>
              <p className="text-sm text-muted-foreground">View and respond to comments on your game design documents</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Recent Comments</h3>
                  <select className="p-2 border rounded-md w-[180px]" defaultValue="all">
                    <option value="all">All Sections</option>
                    <option value="overview">Game Overview</option>
                    <option value="mechanics">Game Mechanics</option>
                    <option value="characters">Characters & Story</option>
                    <option value="art">Art & Audio</option>
                    <option value="technical">Technical Specs</option>
                  </select>
                </div>

                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="space-y-4">
                      <div className="p-4 rounded-md border">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {comment.user.avatar ? (
                                <img src={comment.user.avatar} alt={comment.user.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-medium">{comment.user.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{comment.user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {comment.section} • {comment.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                        <div className="flex gap-2 mt-2">
                          <button className="h-7 text-xs px-2 py-1 text-gray-600 rounded-md hover:bg-gray-100 flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Reply
                          </button>
                        </div>
                      </div>

                      {comment.replies.length > 0 && (
                        <div className="ml-8 space-y-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="p-4 rounded-md border">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                    {reply.user.avatar ? (
                                      <img src={reply.user.avatar} alt={reply.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-sm font-medium">{reply.user.name.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{reply.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{reply.timestamp}</p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
