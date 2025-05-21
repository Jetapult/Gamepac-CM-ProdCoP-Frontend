import React from "react";
import { FileText, Plus } from "lucide-react";
import Layout from "../Layout";

export default function GDDList() {
  const projects = [
    {
      id: "project-1",
      title: "Space Explorer RPG",
      description: "A sci-fi RPG with exploration and resource management",
      lastEdited: "2 days ago",
      sections: 8,
      completion: 75,
    },
    {
      id: "project-2",
      title: "Puzzle Adventure",
      description: "A puzzle game with adventure elements and a unique art style",
      lastEdited: "5 days ago",
      sections: 6,
      completion: 60,
    },
    {
      id: "project-3",
      title: "Strategy Conquest",
      description: "A turn-based strategy game with multiplayer capabilities",
      lastEdited: "1 week ago",
      sections: 10,
      completion: 40,
    },
  ]

  return (
    <Layout>
      <div className="container mx-auto py-8 px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Game Design Documents</h1>
            <p className="text-muted-foreground">Manage and edit your game design documents</p>
          </div>
          <a href="/gdd/new">
            <button className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New GDD
            </button>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="border bg-white rounded-lg shadow-sm">
              <div className="p-6 pb-2">
                <h3 className="text-xl font-semibold">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last edited:</span>
                    <span>{project.lastEdited}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sections:</span>
                    <span>{project.sections}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion:</span>
                      <span>{project.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#B9FF66] rounded-full h-2" style={{ width: `${project.completion}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-2 flex justify-between">
                <a 
                  href={`/gdd/${project.id}`}
                  className="px-4 py-2 border rounded-md flex items-center hover:bg-accent"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Open
                </a>
                <a 
                  href={`/gdd/translator/${project.id}`}
                  className="px-4 py-2 border rounded-md hover:bg-accent"
                >
                  Visualize
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
