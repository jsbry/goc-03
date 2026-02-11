package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	rt "github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed frontend/dist
var assets embed.FS

var (
	pageName      = "markdown"
	isViewComment = true
)

func main() {
	// Create an instance of the app structure
	app := NewApp()

	AppMenu := menu.NewMenu()

	// File
	FileMenu := AppMenu.AddSubmenu("File")
	FileMenu.AddText("Open", keys.CmdOrCtrl("o"), func(_ *menu.CallbackData) {
		// do something
	})
	FileMenu.AddSeparator()
	FileMenu.AddText("Quit", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
		rt.Quit(app.ctx)
	})

	// View
	ViewMenu := AppMenu.AddSubmenu("View")
	ViewMenu.AddRadio("Flow", pageName == "flow", keys.CmdOrCtrl("n"), func(_ *menu.CallbackData) {
		pageName = "flow"
		runtime.EventsEmit(app.ctx, "pageName", "flow")
	})
	ViewMenu.AddRadio("Markdown", pageName == "markdown", keys.CmdOrCtrl("m"), func(_ *menu.CallbackData) {
		pageName = "markdown"
		runtime.EventsEmit(app.ctx, "pageName", "markdown")
	})
	ViewMenu.AddSeparator()
	ViewMenu.AddCheckbox("Comment", isViewComment, nil, func(_ *menu.CallbackData) {
		isViewComment = !isViewComment
		runtime.EventsEmit(app.ctx, "isViewComment", isViewComment)
	})

	// Create application with options
	err := wails.Run(&options.App{
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
