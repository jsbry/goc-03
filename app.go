package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx    context.Context
	server *http.Server
	nodes  []Node
}

type AppConstants struct {
	Language       string
	PageName       string
	MarkdownView   string
	IsViewComment  bool
	IsViewEditNode bool
	Workspace      string
	Nodes          string
	Edges          string
	Notes          string
	Comments       string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) GetConstants() AppConstants {
	err := a.publicAssets()
	if err != nil {
		fmt.Println("Error setting up public assets:", err)
		workspace = ""
		workspaceFullPath = ""
		runtime.EventsEmit(a.ctx, "workspace", workspace)
	}

	nodes := a.getJsonFileContent(nodesFile)
	edges := a.getJsonFileContent(edgesFile)
	comments := a.getJsonFileContent(commentsFile)

	notes, _ := a.GetWalkDir()

	return AppConstants{
		Language:       lng,
		PageName:       pageName,
		MarkdownView:   markdownView,
		IsViewComment:  isViewComment,
		IsViewEditNode: isViewEditNode,
		Workspace:      workspace,
		Nodes:          nodes,
		Edges:          edges,
		Notes:          notes,
		Comments:       comments,
	}
}
