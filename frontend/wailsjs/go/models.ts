export namespace main {
	
	export class AppConstants {
	    Language: string;
	    PageName: string;
	    MarkdownView: string;
	    IsViewComment: boolean;
	    IsViewEditNode: boolean;
	    Workspace: string;
	    Nodes: string;
	    Edges: string;
	    Notes: string;
	    Comments: string;
	
	    static createFrom(source: any = {}) {
	        return new AppConstants(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Language = source["Language"];
	        this.PageName = source["PageName"];
	        this.MarkdownView = source["MarkdownView"];
	        this.IsViewComment = source["IsViewComment"];
	        this.IsViewEditNode = source["IsViewEditNode"];
	        this.Workspace = source["Workspace"];
	        this.Nodes = source["Nodes"];
	        this.Edges = source["Edges"];
	        this.Notes = source["Notes"];
	        this.Comments = source["Comments"];
	    }
	}

}

