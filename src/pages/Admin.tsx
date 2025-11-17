import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBlogManager from "@/components/admin/AdminBlogManager";
import AdminRelatedSearches from "@/components/admin/AdminRelatedSearches";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminPreLanding from "@/components/admin/AdminPreLanding";
import DataOrbitZoneAnalytics from "@/components/admin/DataOrbitZoneAnalytics";
import WebResultsAnalytics from "@/components/admin/WebResultsAnalytics";
import DataOrbitZoneBlogManager from "@/components/admin/dataorbitzone/DataOrbitZoneBlogManager";
import DataOrbitZoneRelatedSearches from "@/components/admin/dataorbitzone/DataOrbitZoneRelatedSearches";
import WebResultsManager from "@/components/admin/webresults/WebResultsManager";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <Button onClick={() => navigate("/")}>View Site</Button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Tabs defaultValue="blogs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="topicmingle">TopicMingle</TabsTrigger>
            <TabsTrigger value="dataorbitzone">DataOrbitZone</TabsTrigger>
            <TabsTrigger value="webresults">WebResults</TabsTrigger>
          </TabsList>

          {/* TopicMingle Management */}
          <TabsContent value="topicmingle" className="mt-6">
            <Tabs defaultValue="blogs" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="blogs">Blogs</TabsTrigger>
                <TabsTrigger value="searches">Related Searches</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="prelanding">Pre-Landing</TabsTrigger>
              </TabsList>

              <TabsContent value="blogs" className="mt-6">
                <AdminBlogManager />
              </TabsContent>

              <TabsContent value="searches" className="mt-6">
                <AdminRelatedSearches />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <AdminAnalytics />
              </TabsContent>

              <TabsContent value="prelanding" className="mt-6">
                <AdminPreLanding />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* DataOrbitZone Management */}
          <TabsContent value="dataorbitzone" className="mt-6">
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="blogs">Blogs</TabsTrigger>
                <TabsTrigger value="searches">Related Searches</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-6">
                <DataOrbitZoneAnalytics />
              </TabsContent>

              <TabsContent value="blogs" className="mt-6">
                <DataOrbitZoneBlogManager />
              </TabsContent>

              <TabsContent value="searches" className="mt-6">
                <DataOrbitZoneRelatedSearches />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* WebResults Management */}
          <TabsContent value="webresults" className="mt-6">
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="webresults">Web Results</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-6">
                <WebResultsAnalytics />
              </TabsContent>

              <TabsContent value="webresults" className="mt-6">
                <WebResultsManager />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
