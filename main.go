package main

import (
	"embed"
	"fmt"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed frontend/dist
var assets embed.FS

const isDebug = true

const (
	nodesFile    = "nodes.json"
	edgesFile    = "edges.json"
	commentsFile = "comments.json"
)

var (
	lng               = "en"
	pageName          = "markdown"
	isViewComment     = true
	isViewEditNode    = false
	workspace         = "./workspace"
	workspaceFullPath = ""
)

func main() {
	absPath, err := filepath.Abs(workspace)
	if err != nil {
		absPath = ""
	}
	workspaceFullPath = absPath
	workspace = filepath.Base(absPath)

	// Create an instance of the app structure
	app := NewApp()

	AppMenu := app.makeMenu()

	// Create application with options
	err = wails.Run(&options.App{
		Title:    "goc-03",
		Width:    1024,
		Height:   768,
		MinWidth: 640,
		Menu:     AppMenu,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 1},
		OnStartup:        app.startup,
		Bind: []any{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

func (a *App) makeMenu() *menu.Menu {
	AppMenu := menu.NewMenu()
	// File
	FileMenu := AppMenu.AddSubmenu(T("File", nil))
	FileMenu.AddText(T("Open", nil), keys.CmdOrCtrl("o"), func(_ *menu.CallbackData) {
		absPath, err := rt.OpenDirectoryDialog(a.ctx, rt.OpenDialogOptions{
			Title: T("Select a folder", nil),
		})
		if err != nil {
			println("Error:", err.Error())
		} else {
			if absPath != "" {
				a.OpenWorkspace(absPath)
			}
		}
	})
	FileMenu.AddSeparator()
	FileMenu.AddText(T("Quit", nil), keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		rt.Quit(a.ctx)
	})

	// View
	ViewMenu := AppMenu.AddSubmenu(T("View", nil))
	ViewMenu.AddRadio(T("Flow", nil), pageName == "flow", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		pageName = "flow"
		rt.EventsEmit(a.ctx, "pageName", "flow")
	})
	ViewMenu.AddRadio(T("Markdown", nil), pageName == "markdown", keys.CmdOrCtrl("m"), func(_ *menu.CallbackData) {
		pageName = "markdown"
		rt.EventsEmit(a.ctx, "pageName", "markdown")
	})
	ViewMenu.AddSeparator()
	ViewMenu.AddCheckbox(T("Comment", nil), isViewComment, keys.CmdOrCtrl("w"), func(_ *menu.CallbackData) {
		isViewComment = !isViewComment
		rt.EventsEmit(a.ctx, "isViewComment", isViewComment)
	})
	ViewMenu.AddCheckbox(T("Edit Node", nil), isViewEditNode, keys.CmdOrCtrl("e"), func(_ *menu.CallbackData) {
		isViewEditNode = !isViewEditNode
		rt.EventsEmit(a.ctx, "isViewEditNode", isViewEditNode)
	})

	HelpMenu := AppMenu.AddSubmenu(T("Help", nil))
	HelpMenu.AddText(T("Help", nil), keys.Key("f1"), func(d *menu.CallbackData) {
		rt.EventsEmit(a.ctx, "help", true)
	})
	HelpMenu.AddSeparator()
	HelpMenu.AddRadio(T("English", nil), lng == "en", nil, func(_ *menu.CallbackData) {
		lng = "en"
		rt.EventsEmit(a.ctx, "lng", "en")
		a.updateMenu()
	})
	HelpMenu.AddRadio(T("日本語", nil), lng == "ja", nil, func(_ *menu.CallbackData) {
		lng = "ja"
		rt.EventsEmit(a.ctx, "lng", "ja")
		a.updateMenu()
		fmt.Println("change ja 2")
	})

	return AppMenu
}

func (a *App) updateMenu() {
	Load(lng)
	AppMenu := a.makeMenu()
	rt.MenuSetApplicationMenu(a.ctx, AppMenu)
}
