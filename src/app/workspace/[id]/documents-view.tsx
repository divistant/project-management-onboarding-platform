"use client";

import type { OnboardingRequest } from "@/types/onboarding";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Eye, Upload } from "lucide-react";

export function DocumentsView({ request }: { request: OnboardingRequest }) {
  if (request.documents.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">No documents uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">Upload documents to start the extraction pipeline.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {request.documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">{doc.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{doc.type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {doc.source === "sharepoint" ? "SharePoint" : "Upload"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB` : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-1 h-4 w-4" /> Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {doc.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{doc.type}</Badge>
                        <span>{doc.source === "sharepoint" ? "SharePoint" : "Upload"}</span>
                        <span>&middot;</span>
                        <span>{doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB` : "Unknown size"}</span>
                        <span>&middot;</span>
                        <span>Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>
                      <ScrollArea className="h-[60vh] rounded-md border p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {doc.extractedMarkdown || "No extracted content available."}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}
