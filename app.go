package main

import (
	"context"
	"fmt"
	"net/http"
	"path/filepath"
)

// App struct
type App struct {
	ctx    context.Context
	server *http.Server
}

type AppConstants struct {
	PageName       string
	IsViewComment  bool
	IsViewEditNode bool
	Workspace      string
	Nodes          string
	Edges          string
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
	absPath, err := filepath.Abs(workspace)
	if err != nil {
		absPath = ""
	}
	workspace = filepath.Base(absPath)
	a.publicAssets()

	nodes := getJsonFileContent("nodes.json")
	edges := getJsonFileContent("edges.json")

	return AppConstants{
		PageName:       pageName,
		IsViewComment:  isViewComment,
		IsViewEditNode: isViewEditNode,
		Workspace:      workspace,
		Nodes:          nodes,
		Edges:          edges,
	}
}
