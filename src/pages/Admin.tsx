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
import TopSportsAnalytics from "@/components/admin/topsports/TopSportsAnalytics";
import TopSportsWebResults from "@/components/admin/topsports/TopSportsWebResults";
import TopSportsCategories from "@/components/admin/topsports/TopSportsCategories";
import TopSportsHeroEditor from "@/components/admin/topsports/TopSportsHeroEditor";
import TopUniversityTerritianAnalytics from "@/components/admin/topuniversityterritian/TopUniversityTerritianAnalytics";
import TopUniversityTerritianWebResults from "@/components/admin/topuniversityterritian/TopUniversityTerritianWebResults";
import TopUniversityTerritianCategories from "@/components/admin/topuniversityterritian/TopUniversityTerritianCategories";
import TopUniversityTerritianLandingPage from "@/components/admin/topuniversityterritian/TopUniversityTerritianLandingPage";
import TopUniversityTerritianRelatedSearches from "@/components/admin/topuniversityterritian/TopUniversityTerritianRelatedSearches";
import TopUniversityTerritianPreLanding from "@/components/admin/topuniversityterritian/TopUniversityTerritianPreLanding";
import TopUniversityTerritianGeoRestrictions from "@/components/admin/topuniversityterritian/TopUniversityTerritianGeoRestrictions";
import TopUniversityTerritianEmailCaptures from "@/components/admin/topuniversityterritian/TopUniversityTerritianEmailCaptures";
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="topicmingle">TopicMingle</TabsTrigger>
            <TabsTrigger value="dataorbitzone">DataOrbitZone</TabsTrigger>
            <TabsTrigger value="webresults">WebResults</TabsTrigger>
            <TabsTrigger value="topsports">TopSports</TabsTrigger>
            <TabsTrigger value="topuniversityterritian">TopUniversityTerritian</TabsTrigger>
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

          {/* TopSports Management */}
          <TabsContent value="topsports" className="mt-6">
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="webresults">Web Results</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="hero">Hero Editor</TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-6">
                <TopSportsAnalytics />
              </TabsContent>

              <TabsContent value="webresults" className="mt-6">
                <TopSportsWebResults />
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
                <TopSportsCategories />
              </TabsContent>

              <TabsContent value="hero" className="mt-6">
                <TopSportsHeroEditor />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* TopUniversityTerritian Management */}
          <TabsContent value="topuniversityterritian" className="mt-6">
            <Tabs defaultValue="landing" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="landing">Landing Page</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="webresults">Web Results</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="prelanding">Pre-Landing</TabsTrigger>
                <TabsTrigger value="geo">Geo-Restrictions</TabsTrigger>
                <TabsTrigger value="email">Email Captures</TabsTrigger>
              </TabsList>

              <TabsContent value="landing" className="mt-6">
                <TopUniversityTerritianLandingPage />
                <div className="mt-6">
                  <TopUniversityTerritianRelatedSearches />
                </div>
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
                <TopUniversityTerritianCategories />
              </TabsContent>

              <TabsContent value="webresults" className="mt-6">
                <TopUniversityTerritianWebResults />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <TopUniversityTerritianAnalytics />
              </TabsContent>

              <TabsContent value="prelanding" className="mt-6">
                <TopUniversityTerritianPreLanding />
              </TabsContent>

              <TabsContent value="geo" className="mt-6">
                <TopUniversityTerritianGeoRestrictions />
              </TabsContent>

              <TabsContent value="email" className="mt-6">
                <TopUniversityTerritianEmailCaptures />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
