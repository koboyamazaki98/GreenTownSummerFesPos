Dim filePath
Dim fso
Dim objIE

Set fso = CreateObject("Scripting.FileSystemObject")
filePath = WScript.ScriptFullName
filePath = fso.GetParentFolderName(filePath)
Set fso = Nothing
'MsgBox filePath

Set objIE = CreateObject("InternetExplorer.Application")
objIE.Width = 900
objIE.Height = 500
objIE.AddressBar = False
objIE.ToolBar = False
'objIE.StatusBar = False
objIE.Resizable = True
objIE.Navigate "file://" & filePath & "\ShokkenPos.html"
objIE.Visible = True
