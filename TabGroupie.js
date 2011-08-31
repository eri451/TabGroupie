"use strict";
XML.ignoreWhitespace = false;
XML.prettyPrinting   = false;
var INFO =
<plugin name="TapGroupie" version="0.1"
        href="https://github.com/eri451/TabGroupie"
        summary="TabGroupie Plugin"
        xmlns={NS}>
    <author email="hans.orter@gmx.de">Eri!</author>
    <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
    <project name="Pentadactyl" min-version="1.0b7.2"/>
    <p>
        This plugin allows you to create tabgroups,
        rename them and move the currently use tab from group to group
        with pentadactyl.
    </p>
    <item>
        <tags>:ren :rename </tags>
        <spec>:rename <oa>current_name</oa> <oa>new_name</oa></spec>
        <description>
            To set a name to a exsisting group use  
        </description>
    </item>
    <item>
       <tags>:new :newgroup</tags>
       <spec>:newgroup <oa>newgroupname</oa></spec>
       <description>
            Create a new tabgroup.
       </description>
    </item>
    <item>
        <tags>:chan :changegroup</tags>
        <spec>:changegroup <oa>targetgroupname</oa></spec>
        <description>
            A groupname, that is not listed, will be handled as a new group
            with a new name assumed you confirm the messagebox.
        </description>    
    </item>
</plugin>;



let TabGroupie = {
    init: function init(){
        try{
            if (!("_groups" in tabs)){
                if (window.TabView && TabView._initFrame)
                    TabView._initFrame();

                let iframe = document.getElementById("tab-view");
                tabs._groups = iframe ? iframe.contentWindow : null;
                if (tabs._groups){
                    util.waitFor(function () tabs._groups.TabItems, tabs);
                }
            }
            
            this.TabGroups = new Array();
            for (let x in tabs._groups.GroupItems.groupItems){
                if (tabs._groups.GroupItems.groupItems[x]._children.length === 0){
                    tabs._groups.GroupItems.groupItems[x].close();
                    continue;
                }
                let group = {"id":    tabs._groups.GroupItems.groupItems[x].id,
                             "title": tabs._groups.GroupItems.groupItems[x].getTitle()
                            };
                this.TabGroups.push(group);
            }
        }
        catch(err){
            dactyl.echoerr("FATAL - Init failed");
        }    
    },
    
    
    getIdByTitle: function getIdByTitle(pattern){
        for (let i in this.TabGroups){
            if (this.TabGroups[i].title === pattern)
                return this.TabGroups[i].id;
        }
        
        if (confirm("This Group does not yet exists.\nDo you want to create a new Group with this title?"))
            return this.createGroup(pattern , true);
        return null;
    },


    changeGroup: function changeGroup(TargetGroupTitle){
        let activeTab = window.gBrowser.selectedTab;
        let targetGroupId = this.getIdByTitle(TargetGroupTitle);
            
        if (targetGroupId != null){
            TabView.moveTabTo(activeTab, targetGroupId);
            TabView.hide();
        }
        
        if (tabs._groups.GroupItems.getNextGroupItemTab(true).parent._children.length === 0)
            tabs._groups.GroupItems.getNextGroupItemTab(true).parent.close();
    },


    changeTitle: function changeTitle(curTitle, newTitle){
        let current = this.getIdByTitle(curTitle);
        
        if (current != null)
            tabs._groups.GroupItems.groupItem(current).setTitle(newTitle);
    },


    newTabGroup: function newTabGroup(title){
       this.createGroup(title, false);
    },


    createGroup: function createGroup(title, current){
         let tab = (current == true) ? window.gBrowser.selectedTab 
                                 : window.gBrowser.addTab(prefs.get("browser.startup.homepage"));

        let newGroup = tabs._groups.GroupItems.newGroup();
        newGroup.setTitle(title);
        TabView.moveTabTo(tab, newGroup.id);
        TabView.hide();
        
//        window.gBrowser.selectTabAtIndex(tabs.index(tab, "allTabs"));
//TODO focus to new created Group
        return newGroup.id;
    },
    
    
    deleter: function deleter(title){
        for (let i in tabs._groups.GroupItems.groupItems){
            if (tabs._groups.GroupItems.groupItems[i].id === this.getIdByTitle(title)){
                for (let x in tabs._groups.GroupItems.groupItems[i]._children){
                    tabs._groups.GroupItems.groupItems[i]._children[x].close();
                }
            tabs._groups.GroupItems.groupItems[i].close();
            }
        }
    }
}

try{
    TabGroupie.init();
}
catch (err){
    dactyl.echoerr("FATAL - Init failed");
}

group.commands.add(["chan[getabgroup]", "ctg"],
                    "Change current tab to another Group.", 
                    function (args){
                        TabGroupie.changeGroup("" + args[0]);
                        TabGroupie.init();
                    },
                    {argCount: "1"});
                    
group.commands.add(["ren[ametabgroup]", "rtg"],
                    "Change the title of a Group",
                    function (args){
                        TabGroupie.changeTitle("" + args[0], "" + args[1]);
                        TabGroupie.init();
                    },
                    {argCount: "2"});

group.commands.add(["new[tabgroup]", "ntg"],
                    "add a new tabgroup",
                    function (args){
                        TabGroupie.newTabGroup( "" + args[0]);
                        TabGroupie.init();
                    },
                    {argCount: "1"});
                    
group.commands.add(["delt[abgroup]", "dtg"],
                    "delete a TabGroup incl. its items",
                    function (args) {
                        TabGroupie.deleter("" + args[0]);
                        TabGroupie.init();
                    },
                    {argCount: "1"});
