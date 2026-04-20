package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"net"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) OpenWorkspace(absPath string) {
	dir := filepath.Base(absPath)
	workspace = dir
	workspaceFullPath = absPath
	runtime.EventsEmit(a.ctx, "workspace", workspace)

	err := a.publicAssets()
	if err != nil {
		fmt.Println("Error setting up public assets:", err)
	}

	nodes := a.getJsonFileContent(nodesFile)
	runtime.EventsEmit(a.ctx, "nodes", nodes)

	edges := a.getJsonFileContent(edgesFile)
	runtime.EventsEmit(a.ctx, "edges", edges)

	comments := a.getJsonFileContent(commentsFile)
	runtime.EventsEmit(a.ctx, "comments", comments)

	notes, _ := a.GetWalkDir()
	runtime.EventsEmit(a.ctx, "notes", notes)
}

func (a *App) publicAssets() error {
	if a.server != nil {
		a.server.Shutdown(context.Background())
	}
	if workspaceFullPath == "" {
		return nil
	}

	info, err := os.Stat(workspaceFullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("workspace directory does not exist: %s", workspaceFullPath)
		}
		return fmt.Errorf("error accessing workspace directory: %w", err)
	}
	if !info.IsDir() {
		return fmt.Errorf("workspace is not a directory: %s", workspaceFullPath)
	}

	filesDir := filepath.Join(workspaceFullPath, "assets")

	info, err = os.Stat(filesDir)
	if err != nil {
		if os.IsNotExist(err) {
			err = os.Mkdir(filesDir, 0755)
			if err != nil {
				return fmt.Errorf("failed to create assets directory: %w", err)
			}
			info, err = os.Stat(filesDir)
		}
	}
	if !info.IsDir() {
		return fmt.Errorf("assets path is not a directory: %s", filesDir)
	}

	mux := http.NewServeMux()
	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(filesDir))))

	listener, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return err
	}
	runtime.EventsEmit(a.ctx, "baseURL", fmt.Sprintf("http://%s/", listener.Addr().String()))

	a.server = &http.Server{
		Handler: mux,
	}

	go func() {
		a.server.Serve(listener)
	}()

	return nil
}

func (a *App) SaveToAssets(src string) (string, error) {
	if workspaceFullPath == "" {
		return "", nil
	}

	filename := filepath.Base(src)
	dest := filepath.Join(workspaceFullPath, "assets", filename)

	input, err := os.ReadFile(src)
	if err != nil {
		return "", fmt.Errorf("failed to read source file: %w", err)
	}

	err = os.WriteFile(dest, input, 0644)
	if err != nil {
		return "", fmt.Errorf("failed to write file to assets: %w", err)
	}

	uri := path.Join("assets", filename)

	return uri, nil
}

func (a *App) SaveToAssetsBase64(label string, base64Data string) (string, error) {
	if workspaceFullPath == "" {
		return "", nil
	}

	if !strings.HasPrefix(base64Data, "data:image") {
		return "", errors.New("invalid image data")
	}

	parts := strings.SplitN(base64Data, ",", 2)
	if len(parts) != 2 {
		return "", errors.New("invalid base64 format")
	}

	meta := parts[0]
	base64Data = parts[1]

	ext := "png"
	if strings.Contains(meta, "image/jpeg") {
		ext = "jpg"
	}
	if strings.Contains(meta, "image/webp") {
		ext = "webp"
	}

	decoded, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", err
	}
	_, _, err = image.Decode(bytes.NewReader(decoded))
	if err != nil {
		return "", errors.New("invalid image file")
	}

	filename := label + "." + ext
	dest := filepath.Join(workspaceFullPath, "assets", filename)
	err = os.WriteFile(dest, decoded, 0644)
	if err != nil {
		return "", err
	}

	uri := path.Join("assets", filename)
	return uri, nil
}

func (a *App) RemoveAsset(filename string) {
	if workspaceFullPath == "" {
		return
	}

	removeFilepath := filepath.Join(workspaceFullPath, filename)
	os.Remove(removeFilepath)
}

func (a *App) RemoveUnusedAssets() {
	assetsDir := filepath.Join(workspaceFullPath, "assets")
	assetFiles, err := os.ReadDir(assetsDir)
	if err != nil {
		return
	}

	usedAssets := make(map[string]bool)
	for _, node := range a.nodes {
		switch node.Type {
		case "imageNode":
			if strings.HasPrefix(node.Data.ImageURL, "assets/") {
				usedAssets[node.Data.ImageURL] = true
			}
		case "videoNode":
			if strings.HasPrefix(node.Data.VideoURL, "assets/") {
				usedAssets[node.Data.VideoURL] = true
			}
		}
	}

	for _, note := range a.notes {
		noteByte, err := os.ReadFile(filepath.Join(workspaceFullPath, fmt.Sprintf("%s.md", note)))
		if err != nil {
			continue
		}
		mdAssetsList := extractAssetsFromMarkdown(string(noteByte))
		for _, asset := range mdAssetsList {
			usedAssets[asset] = true
		}
	}

	for _, asset := range assetFiles {
		if asset.IsDir() {
			continue
		}
		assetPath := path.Join("assets", asset.Name())
		if !usedAssets[assetPath] {
			removeFilepath := filepath.Join(workspaceFullPath, assetPath)
			os.Remove(removeFilepath)
		}
	}
}

var (
	markdownImageRegex = regexp.MustCompile(`!\[[^\]]*\]\(\s*([^)\s]+)`)
	htmlImageRegex     = regexp.MustCompile(`<img[^>]+src=["']([^"']+)["']`)
)

func extractAssetsFromMarkdown(content string) []string {
	seen := make(map[string]struct{})

	add := func(raw string) {
		if raw == "" {
			return
		}

		if i := strings.Index(raw, "assets/"); i >= 0 {
			raw = raw[i:]
			seen[raw] = struct{}{}
		}
	}

	for _, match := range markdownImageRegex.FindAllStringSubmatch(content, -1) {
		add(match[1])
	}
	for _, match := range htmlImageRegex.FindAllStringSubmatch(content, -1) {
		add(match[1])
	}

	result := make([]string, 0, len(seen))
	for asset := range seen {
		result = append(result, asset)
	}

	return result
}
