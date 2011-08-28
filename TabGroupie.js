"use strict";
XML.ignoreWhitespace = false;
XML.prettyPrinting   = false;
var INFO =
<plugin name="TapGroupie" version="0.1"
        href="http://dactyl.sf.net/pentadactyl/plugins#setTabGroup"
        summary="set your Tabgroups with pentadactyl"
        xmlns={NS}>
    <author email="hans.orter@gmx.de">Eri!</author>
    <license href="http://opensource.org/licenses/mit-license.php">MIT</license>
    <project name="Pentadactyl" min-version="1.0b7.2"/>
    <p>
        This Plugin allows you to rename and set your tabgroups
    </p>
    <item>
        <tags>:tg :tabgroupie </tags>
        <spec>:tabgroupie <oa>name</oa> <oa>useragent</oa></spec>
        <discription>
            <p>
                To set a name to a exsisting group use
                "rename [CURRENT_GROUPNAME] [NEW_GROUPNAME]".
            </p>
            <p>
                 A groupname, that is not listed, will be handled as a new group
                 with a new name.
                 "newgroup [NEW_GROUPNAME]"
            </p>
            <p>
                To move the current tab into another group use
                "changegroup [TARGETGROUPTITLE]"
            </p>
        </discription>
     </item>
</plugin>;




//######################## Gehversuche ############################

let TabGroupie = {
    init: function init(){
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
            let cur = tabs._groups.GroupItems.groupItems[x];
            let group = {"id": cur.id, "title": cur.getTitle()};
            this.TabGroups.push(group);
        }        
    },
    
    
    getIdByTitle: function getIdByTitle(pattern){
        for (let i in this.TabGroups){
            if (this.TabGroups[i].title === pattern){
                return this.TabGroups[i].id;
            }
        }
        
        if (confirm("This Group does not yet exists.\nDo you want to create a new Group with this title?"))
            return this.createGroup(pattern , true);
        return null;
    },


    changeGroup: function changeGroup(TargetGroupTitle){
        let activeTab = window.gBrowser.selectedTab;
        let targetGroupId = this.getIdByTitle(TargetGroupTitle);
        
        if (targetGroupId != null)
            TabView.moveTabTo(activeTab, targetGroupId);
        
        
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
        return newGroup.id;
    }
}

try{
    TabGroupie.init();
}
catch (err){
    dactyl.echoerr("FATAL - Init failed");
}

group.commands.add(["chan[gegroup]", "cg"],
                    "Change current tab to another Group.", 
                    function (args){
                        TabGroupie.changeGroup("" + args[0]);
                    },
                    {argCount: "1"});
                    
group.commands.add(["ren[ame]", "rn"],
                    "Change the title of a Group",
                    function (args){
                        TabGroupie.changeTitle("" + args[0], "" + args[1]);
                    },
                    {argCount: "2"});

group.commands.add(["new[group]", "ng"],
                    "add a new tabgroup",
                    function (args){
                        TabGroupie.newTabGroup( "" + args[0]);
                    },
                    {argCount: "1"});
