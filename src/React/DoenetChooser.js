import React, { Component } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;
import crypto from 'crypto';
import nanoid from 'nanoid';
import "./chooser.css";
import DoenetHeader from './DoenetHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDotCircle, faFileAlt, faEdit, faCaretRight, faCaretDown, 
  faChalkboard, faArrowCircleLeft, faTimesCircle, faPlusCircle, faFolder, faSave} 
  from '@fortawesome/free-solid-svg-icons';
import IndexedDB from '../services/IndexedDB';
import DoenetBranchBrowser from './DoenetBranchBrowser';
import SpinningLoader from './SpinningLoader';


class DoenetChooser extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      error: null,
      errorInfo: null,
      selectedDrive: "Content",
      selectedCourse: null,
      selectedItems: [],
      selectedItemsType: [],
      showNewButtonMenu: false,
      activeSection: "chooser",
      directoryStack: [],
    };


    this.loadUserContentBranches();
    this.loadUserFoldersAndRepo();
    this.loadAllCourses();

    this.branches_loaded = false;
    this.courses_loaded = false;
    this.folders_loaded = false;

    this.updateNumber = 0;

    this.browser = React.createRef();

    this.handleNewDocument = this.handleNewDocument.bind(this);
    this.saveContentToServer = this.saveContentToServer.bind(this);
    this.getContentId = this.getContentId.bind(this);
    this.toggleManageCourseForm = this.toggleManageCourseForm.bind(this);
    this.saveCourse = this.saveCourse.bind(this);
    this.selectDrive = this.selectDrive.bind(this);
    this.handleNewCourseCreated = this.handleNewCourseCreated.bind(this);
    this.handleNewFolder = this.handleNewFolder.bind(this);
    this.addNewFolder = this.addNewFolder.bind(this);
    this.handleNewRepo = this.handleNewRepo.bind(this);
    this.addNewRepo = this.addNewRepo.bind(this);
    this.addContentToFolder = this.addContentToFolder.bind(this);
    this.removeContentFromFolder = this.removeContentFromFolder.bind(this);
    this.addContentToCourse = this.addContentToCourse.bind(this);
    this.removeContentFromCourse = this.removeContentFromCourse.bind(this);
    this.updateSelectedItems = this.updateSelectedItems.bind(this);
    this.updateDirectoryStack = this.updateDirectoryStack.bind(this);
    this.jumpToDirectory = this.jumpToDirectory.bind(this);
    this.saveUserContent = this.saveUserContent.bind(this);
    this.modifyRepoAccess = this.modifyRepoAccess.bind(this);
    this.renameFolder = this.renameFolder.bind(this);
  }


  buildCourseList() {
    this.courseList = [];
    for(let courseId of this.courseIds){
      let courseCode = this.courseInfo[courseId].courseCode;

      let classes = (this.state.selectedDrive === "Courses") && (courseId === this.state.selectedCourse) ? 
                      "leftNavPanelMenuItem activeLeftNavPanelMenuItem": "leftNavPanelMenuItem";
      this.courseList.push(
        <li className={classes} 
            key={"course" + courseId}
            style={{"padding":"6px 1px 6px 5px","width": "90%"}}
            onClick={() => this.selectDrive("Courses", courseId)}>
            <FontAwesomeIcon className="menuDoughnutIcon" icon={faDotCircle}/>
            <span>{courseCode}</span>
            {this.state.selectedItems.length !== 0 &&
            <div className="addContentToCourseButtonWrapper">
              {this.state.selectedDrive !== "Courses" && 
                <FontAwesomeIcon icon={faPlus} className="addContentButton"
                onClick={() => this.addContentToCourse(courseId, this.state.selectedItems, this.state.selectedItemsType)}/>}
            </div>}
        </li>
      );
    }
  }

  buildLeftNavPanel() {
    this.leftNavPanel = <React.Fragment>
      <div className="leftNavPanel">
        <div id="newContentButtonContainer">
          <div id="newContentButton" data-cy="newContentButton" onClick={this.toggleNewButtonMenu}>
            <FontAwesomeIcon icon={faPlus} style={{"fontSize":"25px", "color":"#43aa90"}}/>
            <span>New</span>
            {this.state.showNewButtonMenu && 
              <div id="newContentButtonMenu" data-cy="newContentMenu">
                <div className="newContentButtonMenuSection">
                  <div className="newContentButtonMenuItem" onClick={this.handleNewDocument} data-cy="newDocumentButton">
                    <FontAwesomeIcon icon={faFileAlt} style={{"fontSize":"18px", "color":"#a7a7a7", "marginRight":"18px"}}/>
                    <span>Document</span>
                  </div>
                  <div className="newContentButtonMenuItem" onClick={this.handleNewFolder} data-cy="newFolderButton">
                    <FontAwesomeIcon icon={faFolder} style={{"fontSize":"18px", "color":"#a7a7a7", "marginRight":"18px"}}/>
                    <span>Folder</span>
                  </div>
                  <div className="newContentButtonMenuItem" onClick={this.handleNewRepo} data-cy="newRepoButton">
                    <FontAwesomeIcon icon={faFolder} style={{"fontSize":"18px", "color":"#3aac90", "marginRight":"18px"}}/>
                    <span>Repository</span>
                  </div>
                </div>
                <div className="newContentButtonMenuSection">
                  <div className="newContentButtonMenuItem" onClick={() => this.toggleManageCourseForm("add_course")} data-cy="newCourseButton">
                    <FontAwesomeIcon icon={faChalkboard} style={{"fontSize":"16px", "color":"#a7a7a7", "marginRight":"13px"}}/>
                    <span>Course</span>
                  </div>
                </div>                
              </div>}
          </div>
        </div>
        <div id="leftNavPanelMenu">
          <div className={"Content" === this.state.selectedDrive ? 
                    "leftNavPanelMenuItem activeLeftNavPanelMenuItem": "leftNavPanelMenuItem"} 
            onClick={() => {this.selectDrive("Content")}}>
            <FontAwesomeIcon className="menuDoughnutIcon" icon={faDotCircle}/>
            <span>Content</span>
          </div>
          <div className="leftNavPanelMenuItem">
            <Accordion>
              <div label="Courses">
                <ul style={{"paddingLeft":"20px"}}>
                  { this.courseList }
                </ul>
              </div>
            </Accordion>    
          </div>
        </div>        
      </div>
    </React.Fragment>
  }

  buildTopToolbar() {
    let toolbarTitle = "";

    if (this.state.activeSection === "chooser") {
      // show selectedDrive if chooser is active
      if (this.state.selectedDrive === "Content") {
        toolbarTitle = this.state.selectedDrive;
      } else if (this.state.selectedDrive === "Courses") {
        toolbarTitle = this.courseInfo[this.state.selectedCourse].courseCode + ' - '
        + this.courseInfo[this.state.selectedCourse].courseName;
      }
    } else if (this.state.activeSection === "add_course") {
      toolbarTitle = "Add New Course";
    } else if (this.state.activeSection === "edit_course") {
      toolbarTitle = "Edit Course - " + this.courseInfo[this.state.selectedCourse].courseCode;
    }

    this.topToolbar = <React.Fragment>
      <div id="topToolbar">
        <span>{ toolbarTitle }</span>
      </div>
    </React.Fragment>
  }

  handleNewDocument(){
    let newBranchId = nanoid();
    let num = 1;
    let title = "Untitled Document " + num; 
    while (Object.values(this.branchId_info).filter(content => content.title.includes(title)).length != 0) {
      num++;
      title = "Untitled Document " + num; 
    }

    this.saveContentToServer({
      documentName:title,
      code:"",
      branchId:newBranchId,
      publish:true
    }, (branchId) => {
      this.loadUserContentBranches(() => {
        // if not in base dir, add document to current folder
        if (this.state.directoryStack.length !== 0) {
          let currentFolderId = this.state.directoryStack[this.state.directoryStack.length - 1];
          this.addContentToFolder([branchId], ["content"], currentFolderId);
        } else {
          this.saveUserContent([branchId], ["content"], "insert"); // add to user root
        }
      
        // set as selected and redirect to /editor 
        this.selectDrive("Content");
        window.location.href=`/editor?branchId=${branchId}`;
        this.forceUpdate();   
      })
    });
  }

  toggleNewButtonMenu = () => {
    if (!this.state.showNewButtonMenu) {
      document.addEventListener('click', this.toggleNewButtonMenu, false);
    } else {
      document.removeEventListener('click', this.toggleNewButtonMenu, false);
    }
    
    this.setState(prevState => ({
      showNewButtonMenu: !prevState.showNewButtonMenu
    }));    
  }

  toggleManageCourseForm(mode) {
    if (this.state.activeSection !== mode) {
      this.setState({ activeSection: mode });
    } else {
      this.setState({ activeSection: "chooser" });
    }
  }

  handleNewCourseCreated({courseId, courseName, courseCode, term, description, department, section}) {
    // create new documents for overview and syllabus, get branchIds
    let overviewId = nanoid();
    let overviewDocumentName = courseName + " Overview";
    this.saveContentToServer({
      documentName:overviewDocumentName,
      code:"",
      branchId:overviewId,
      publish:true
    });

    let syllabusId = nanoid();
    let syllabusDocumentName = courseName + " Syllabus";    
    this.saveContentToServer({
      documentName:syllabusDocumentName,
      code:"",
      branchId:syllabusId,
      publish:true
    });
    this.addContentToCourse(courseId, [overviewId, syllabusId], ["content", "content"]);
    this.saveUserContent([overviewId, syllabusId], ["content", "content"], "insert");
    this.saveCourse({
      courseName: courseName,
      courseId: courseId,
      courseCode: courseCode,
      term: term,
      description: description,
      department: department,
      section: section,
      overviewId: overviewId,
      syllabusId: syllabusId
    });
  }

  loadUserContentBranches(callback=(()=>{})) {
    this.branches_loaded = false;

    let currentFolderId = this.state.directoryStack.length === 0 ?
                            "root" : this.state.directoryStack[this.state.directoryStack.length - 1];

    const data={folderId: currentFolderId};
    const payload = {params: data};

    const loadBranchesUrl='/api/loadUserContent.php';
    
    axios.get(loadBranchesUrl, payload)
    .then(resp=>{
      this.branchId_info = Object.assign({}, this.branchId_info, resp.data.branchId_info);
      this.sort_order = resp.data.sort_order;
      this.branches_loaded = true;
      callback();
      this.forceUpdate();
    });
  }

  saveContentToServer({documentName,code,branchId,publish=false}, callback=(()=>{})){
    const url='/api/saveContent.php';
    let ID = this.getContentId({code:code}) //get contentid
    const data={
      title: documentName,
      doenetML: code,
      branchId: branchId,
      contentId:ID,
      author: this.props.username,
      publish: publish,
      change_title_not_code:true,
    }
    axios.post(url, data)
    .then(() => {
      callback(branchId);
    })
    .catch(function (error) {
      this.setState({error:error});
    })
  }

  getContentId ({code}){
    const hash = crypto.createHash('sha256');
    if (code === undefined){
      return;
    }
    
    hash.update(code);
    let contentId = hash.digest('hex');
    return contentId;
  }

  saveCourse({courseId, courseName, courseCode, term, description, department, section, overviewId, syllabusId}, callback=(()=>{})) {
    const url='/api/saveCourse.php';
    const data={
      longName: courseName,
      courseId: courseId,
      shortName: courseCode,
      term: term,
      description: description,
      overviewId: overviewId,
      syllabusId: syllabusId,
      department: department,
      section: section,
    }
    axios.post(url, data)
    .then(resp => {
      // reload list of courses
      this.loadAllCourses(() => {
        this.loadCourseContent(courseId, () => {
          this.setState({
            selectedItems: [],
            activeSection: "chooser",
          });
          this.forceUpdate();
        });
      });
      callback(courseId);
    })
    .catch(function (error) {
      this.setState({error:error});
    })
  }

  loadAllCourses(callback=(()=>{})) {
    const loadCoursesUrl='/api/loadAllCourses.php';
    const data={
    }
    const payload = {
      params: data
    }

    axios.get(loadCoursesUrl,payload)
    .then(resp=>{
      this.courseInfo = resp.data.courseInfo;
      this.courseIds = resp.data.courseIds;
      callback();
      this.courses_loaded = true;
      this.forceUpdate();
    });
  }

  loadCourseContent(courseId, callback=(()=>{})) {
    this.folders_loaded = false;
    this.branches_loaded = false;
    const loadCoursesUrl='/api/loadCourseContent.php';
    const data={
      courseId: courseId
    }
    const payload = {
      params: data
    }

    axios.get(loadCoursesUrl,payload)
    .then(resp=>{
      this.branchId_info = Object.assign({}, this.branchId_info, resp.data.branchInfo);
      this.folderInfo = Object.assign({}, this.folderInfo, resp.data.folderInfo);
      this.folders_loaded = true;
      this.branches_loaded = true;
      callback();
      this.forceUpdate();
    });
  }

  saveCourseContent(courseId, itemIds, itemTypes, operationType, callback=(()=>{})) {
    const url='/api/saveCourseContent.php';
    const data={
      courseId: courseId,
      itemIds: itemIds,
      itemTypes: itemTypes,
      operationType: operationType,
    }
    axios.post(url, data)
    .then((resp) => {
      callback(courseId);
    })
    .catch(function (error) {
      this.setState({error:error});
    })
  }

  selectDrive(drive, courseId=null) {
    if (drive === "Courses") {
      this.setState({
        selectedItems: [],
        selectedItemsType: [],
        activeSection: "chooser",
        selectedDrive: drive,
        selectedCourse: courseId,
        directoryStack: []});
      this.folders_loaded = false;
      this.branches_loaded = false;
      this.updateIndexedDBCourseContent(courseId);
      this.loadCourseContent(courseId);
    } else {
      this.setState({
        selectedItems: [],
        selectedItemsType: [],
        activeSection: "chooser",
        selectedDrive: drive,
        directoryStack: []}, () => {
          this.loadUserContentBranches();
          this.loadUserFoldersAndRepo();
      });
    }
    this.updateNumber++;
  }

  addContentToCourse(courseId, itemIds, itemTypes) {
    let operationType = "insert";
    this.saveCourseContent(courseId, itemIds, itemTypes, operationType ,(courseId) => {
      this.loadAllCourses(() => {
        this.selectDrive("Courses", courseId);
      });
    });
  }

  removeContentFromCourse(itemIds) {
    let operationType = "remove";
    let courseId = this.state.selectedCourse;
    this.saveCourseContent(courseId, itemIds, [], operationType ,(courseId) => {
      this.loadAllCourses();
    });
  }

  saveFolder(folderId, title, childContent, childType, operationType, isRepo, callback=(()=>{})) {
    // check if new folder
    let currentFolderId = this.state.directoryStack.length == 0 ? "root" : this.state.directoryStack[this.state.directoryStack.length - 1];
    let parentId = this.folderInfo[folderId] ? this.folderInfo[folderId].parentId : currentFolderId;
    if (isRepo) parentId = "root";  // repo always at root

    const url='/api/saveFolder.php';
    const data={
      title: title,
      folderId: folderId,
      childContent: childContent,
      childType: childType,
      operationType: operationType,
      parentId: parentId,
      isRepo: isRepo
    }
    axios.post(url, data)
    .then((resp) => {
      callback(folderId);
    })
    .catch(function (error) {
      this.setState({error:error});
    })
  }

  loadUserFoldersAndRepo(callback=(()=>{})) {
    this.folders_loaded = false;
    let currentFolderId = this.state.directoryStack.length === 0 ?
                            "root" : this.state.directoryStack[this.state.directoryStack.length - 1];

    const loadUserFoldersAndRepoUrl='/api/loadUserFoldersAndRepo.php';
    const data={folderId: currentFolderId};
    const payload = {params: data};
    
    axios.get(loadUserFoldersAndRepoUrl,payload)
    .then(resp=>{
      this.folderInfo = Object.assign({}, this.folderInfo, resp.data.folderInfo);
      this.folderIds = resp.data.folderIds;
      this.folders_loaded = true;
      callback();
      this.updateNumber++;
      this.forceUpdate();
    });
  }

  addNewFolder(title) {
    let folderId = nanoid();
    this.saveFolder(folderId, title, [], [], "insert", false, () => {
      // if not in base dir, add folder to current folder
      if (this.state.directoryStack.length !== 0) {
        let currentFolderId = this.state.directoryStack[this.state.directoryStack.length - 1];
        this.addContentToFolder([folderId], ["folder"], currentFolderId);
      } else {
        this.saveUserContent([folderId], ["folder"], "insert", () => {  // add to user root
          this.setState({
            selectedItems: [folderId],
            selectedItemsType: ["folder"],
            activeSection: "chooser",
            selectedDrive: "Content",
          }, () => {
            this.loadUserFoldersAndRepo();
            this.loadUserContentBranches();
          });
        });  
      }
    });
  }

  addContentToFolder(childId, childType, folderId) {
    let operationType = "insert";
    let title = this.folderInfo[folderId].title;
    let isRepo = this.folderInfo[folderId].isRepo;
    if (this.folderInfo[folderId].parentId == "root") {
      this.saveUserContent(childId, childType, "remove");
    }
    this.saveFolder(folderId, title, childId, childType, operationType, isRepo, (folderId) => {
      this.loadUserFoldersAndRepo();
      this.loadUserContentBranches();
    });
  }

  removeContentFromFolder(childId, childType, folderId) {
    let operationType = "remove";
    let title = this.folderInfo[folderId].title;
    let isRepo = this.folderInfo[folderId].isRepo;
    if (this.folderInfo[folderId].parentId == "root") {
      this.saveUserContent(childId, childType, "insert");
    }
    this.saveFolder(folderId, title, childId, childType, operationType, isRepo, (folderId) => {
      this.loadUserFoldersAndRepo();
      this.loadUserContentBranches();
    });
  }

  renameFolder(folderId, newTitle) {
    this.saveFolder(folderId, newTitle, [], [], "", this.folderInfo[folderId].isRepo, () => {
      this.loadUserFoldersAndRepo();
    });
  }

  saveUserContent(childIds, childType, operationType, callback=(()=>{})) {
    const url='/api/saveUserContent.php';
    const data={
      childIds: childIds,
      childType: childType,
      operationType: operationType
    }
    axios.post(url, data)
    .then(resp => {
      callback();
    })
    .catch(function (error) {
      this.setState({error:error});
    })
  }

  handleNewFolder() {
    // TODO: let user input folder title
    let num = 1;
    let title = "New Folder " + num; 
    while (Object.values(this.folderInfo).filter(folder => 
      folder.title && folder.title.includes(title)).length != 0) {
      num++;
      title = "New Folder " + num; 
    }
    this.addNewFolder(title);
  }

  handleNewRepo() {
    // TODO: let user input repo title
    let title = "New Repository" 
    this.addNewRepo(title);
  }

  addNewRepo(title) {
    let folderId = nanoid();
    this.saveFolder(folderId, title, [], [], "insert", true, () => {
      this.modifyRepoAccess(folderId, "insert", true, () => {  // add user to repo_access
        this.setState({
          directoryStack: [],
          selectedItems: [folderId],
          selectedItemsType: ["folder"],
          activeSection: "chooser",
          selectedDrive: "Content"
        }, () => {
          this.loadUserFoldersAndRepo();
          this.loadUserContentBranches();
        });
      });  
    })
  }

  modifyRepoAccess(folderId, operationType, owner=false, callback=(()=>{})) {
    const url='/api/modifyRepoAccess.php';
    const data={
      repoId: folderId,
      operationType: operationType,
      owner: owner
    }
    axios.post(url, data)
    .then(resp => {
      callback();
    })
    .catch(function (error) {
      this.setState({error:error});
    })
  }

  jumpToDirectory(directoryData) {
    this.setState({
      directoryStack: directoryData,
      selectedItems: directoryData,
      selectedItemsType: ["folder"],
    })
  }

  updateSelectedItems(selectedItems, selectedItemsType) {
    this.setState({
      selectedItems: selectedItems,
      selectedItemsType: selectedItemsType,
    })
  }

  updateDirectoryStack(directoryStack) {
    this.folders_loaded = false;
    this.branches_loaded = false;
    this.setState({
      directoryStack: directoryStack
    })
    this.loadUserFoldersAndRepo();
    this.loadUserContentBranches();
  }

  getAllSelectedItems = () => {
    this.browser.current.getAllSelectedItems();
  }

  updateIndexedDBCourseContent(courseId) {
    // create a new database object
    let indexedDB = new IndexedDB(); 

    // open a connection to the database
    indexedDB.openDB((result) => {
      // update current course content
      indexedDB.insert("course_content_store", { 
        courseId: courseId,
        courseContent: this.courseInfo[courseId].content,
        courseFolders: this.courseInfo[courseId].folders,
      });

      // update last selected course
      indexedDB.insert("tool_state_store", { 
        toolName: "chooser",
        lastSelectedCourse: courseId,
      });
    });
  }

  render(){

    if (!this.courses_loaded){
      return <div style={{display:"flex",justifyContent:"center",alignItems:"center", height:"100vh"}}>
                <SpinningLoader/>
             </div>
    }

    this.buildCourseList();
    this.buildLeftNavPanel();
    this.buildTopToolbar();

    // setup mainSection to be chooser / CourseForm
    this.mainSection;
    if (this.state.activeSection === "add_course" || this.state.activeSection === "edit_course") {
      this.mainSection = <CourseForm 
                          mode={this.state.activeSection}
                          handleBack={this.toggleManageCourseForm}
                          handleNewCourseCreated={this.handleNewCourseCreated}
                          saveCourse={this.saveCourse}
                          selectedCourse={this.state.selectedCourse}
                          selectedCourseInfo={this.courseInfo[this.state.selectedCourse]}
                          />;
    }
    else {
      let folderList = [];
      let contentList = [];
      if (this.state.selectedDrive === "Content") {
        folderList = this.folderIds;
        contentList = this.sort_order;
      } else if (this.state.selectedDrive === "Courses") {
        folderList = this.courseInfo[this.state.selectedCourse].folders;
        contentList = this.courseInfo[this.state.selectedCourse].content;
      }
      this.mainSection = <React.Fragment>
        <DoenetBranchBrowser
          loading={!this.folders_loaded && !this.branches_loaded}
          allContentInfo={this.branchId_info}
          allFolderInfo={this.folderInfo}
          folderList={folderList}
          contentList={contentList}
          ref={this.browser}                                      // optional
          key={"browser"+this.updateNumber}                       // optional
          selectedDrive={this.state.selectedDrive}                // optional
          selectedCourse={this.state.selectedCourse}              // optional
          allCourseInfo={this.courseInfo}                         // optional
          updateSelectedItems={this.updateSelectedItems}          // optional
          updateDirectoryStack={this.updateDirectoryStack}        // optional
          addContentToFolder={this.addContentToFolder}            // optional
          removeContentFromCourse={this.removeContentFromCourse}  // optional
          removeContentFromFolder={this.removeContentFromFolder}  // optional                  
          directoryData={this.state.directoryStack}               // optional
          selectedItems={this.state.selectedItems}                // optional
          selectedItemsType={this.state.selectedItemsType}        // optional
          renameFolder={this.renameFolder}                        // optional
          openEditCourseForm={() => this.toggleManageCourseForm("edit_course")}
        />
      </React.Fragment>
    }

    return (<React.Fragment>
      <DoenetHeader toolTitle="Chooser" headingTitle={"Choose Branches"} />
      <div id="chooserContainer">
        { this.leftNavPanel }
        { this.topToolbar }
        { this.mainSection }     
      </div>
    </React.Fragment>);
  }
}

class CourseForm extends React.Component {
  static defaultProps = {
    selectedCourse: null,
    selectedCourseInfo: null
  }

  constructor(props) {
    super(props);
    this.state = {
      edited: "",
      courseName: "",
      department: "",
      courseCode: "",
      section: "",
      year: "",
      semester: "Spring",
      description: "",
      roles: [],
    };
    
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.addRole = this.addRole.bind(this);
  }

  componentDidMount() {
    if (this.props.mode == "edit_course" && this.props.selectedCourseInfo !== null) {
      let term = this.props.selectedCourseInfo.term.split(" ");
      this.setState({
        courseName: this.props.selectedCourseInfo.courseName,
        department: this.props.selectedCourseInfo.department,
        courseCode: this.props.selectedCourseInfo.courseCode,
        section: this.props.selectedCourseInfo.section,
        semester: term[0],
        year: term[1],
        description: this.props.selectedCourseInfo.description
      });
    }
  }

  handleChange(event) {
    // set edited to true once any input is detected
    this.setState({ edited: true });
    
    let name = event.target.name;
    let value = event.target.value;
    this.setState({[name]: value});
  }

  handleSubmit(event) {
    let term = this.state.semester + " " + this.state.year;
    if (this.props.mode == "add_course") {
      let courseId = nanoid();
      this.props.handleNewCourseCreated({
        courseName:this.state.courseName,
        courseId: courseId,
        courseCode:this.state.courseCode,
        term: term,
        description: this.state.description,
        department: this.state.department,
        section: this.state.section,
        });
    } else {
      this.props.saveCourse({
        courseName:this.state.courseName,
        courseId: this.props.selectedCourse,
        courseCode:this.state.courseCode,
        term: term,
        description: this.state.description,
        department: this.state.department,
        section: this.state.section,
        overviewId: this.props.selectedCourseInfo.overviewId,
        syllabusId: this.props.selectedCourseInfo.syllabusId
      });
    }
    event.preventDefault();        
    this.props.handleBack();
  }

  handleBack() {
    // popup confirm dialog if form is edited
    if (this.state.edited) {
      if (!window.confirm('All of your input will be discardeed, are you sure you want to proceed?')) {
        return;
      }
    }

    this.props.handleBack(this.props.mode);
  }

  addRole(role) {
    //create a unike key for each new role
    var timestamp = (new Date()).getTime();
    this.state.roles['role-' + timestamp ] = role;
    this.setState({ roles : this.state.roles });
  }


  render() {
    return (
      <div id="newCourseFormContainer">
        <div id="newCourseFormTopbar">
          <div id="newCourseFormBackButton" onClick={this.handleBack} data-cy="newCourseFormBackButton">
            <FontAwesomeIcon icon={faArrowCircleLeft} style={{"fontSize":"17px", "marginRight":"5px"}}/>
            <span>Back to Chooser</span>
          </div>          
        </div>
        <form onSubmit={this.handleSubmit}>
          <div className="newCourseFormGroup-12">
            <label className="newCourseFormLabel">COURSE NAME</label>
            <input className="newCourseFormInput" required type="text" name="courseName" value={this.state.courseName}
              placeholder="Course name goes here." onChange={this.handleChange} data-cy="newCourseFormNameInput"/>
          </div>
          <div className="newCourseFormGroupWrapper">
            <div className="newCourseFormGroup-4" >
              <label className="newCourseFormLabel">DEPARTMENT</label>
              <input className="newCourseFormInput" required type="text" name="department" value={this.state.department}
              placeholder="DEP" onChange={this.handleChange} data-cy="newCourseFormDepInput"/>
            </div>
            <div className="newCourseFormGroup-4">
              <label className="newCourseFormLabel">COURSE CODE</label>
              <input className="newCourseFormInput" required type="text" name="courseCode" value={this.state.courseCode}
                placeholder="MATH 1241" onChange={this.handleChange} data-cy="newCourseFormCodeInput"/>
            </div>
            <div className="newCourseFormGroup-4">
              <label className="newCourseFormLabel">SECTION</label>
              <input className="newCourseFormInput" type="number" name="section" value={this.state.section}
              placeholder="00000" onChange={this.handleChange} data-cy="newCourseFormSectionInput"/>
            </div>
          </div>          
          <div className="newCourseFormGroupWrapper">
            <div className="newCourseFormGroup-4" >
              <label className="newCourseFormLabel">YEAR</label>
              <input className="newCourseFormInput" required type="number" name="year" value={this.state.year}
              placeholder="2019" onChange={this.handleChange} data-cy="newCourseFormYearInput"/>
            </div>
            <div className="newCourseFormGroup-4">
              <label className="newCourseFormLabel">SEMESTER</label>
              <select className="newCourseFormSelect" required name="semester" onChange={this.handleChange} value={this.state.semester}>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
              </select>
            </div>
            <div className="newCourseFormGroup-4">
            </div>
          </div> 
          <div className="newCourseFormGroup-12">
            <label className="newCourseFormLabel">DESCRIPTION</label>
            <textarea className="newCourseFormInput" type="text" name="description" value={this.state.description}
              placeholder="Official course description here" onChange={this.handleChange} data-cy="newCourseFormDescInput"/>
          </div>
          <div className="newCourseFormGroup-12">
            <label className="newCourseFormLabel">ROLES</label>
              <AddRoleForm addRole={this.addRole}/>
              <RoleList roles={this.state.roles}/>
          </div>
          <div id="newCourseFormButtonsContainer">
            <button id="newCourseFormSubmitButton" type="submit" data-cy="newCourseFormSubmitButton">
              <div className="newCourseFormButtonWrapper">
                { this.mode == "add_course" ?
                  <React.Fragment>
                    <span>Create Course</span>
                    <FontAwesomeIcon icon={faPlusCircle} style={{"fontSize":"20px", "color":"#fff", "cursor":"pointer", "marginLeft":"8px"}}/>
                  </React.Fragment>                  
                  : 
                  <React.Fragment>
                    <span>Save Changes</span>
                    <FontAwesomeIcon icon={faSave} style={{"fontSize":"20px", "color":"#fff", "cursor":"pointer", "marginLeft":"8px"}}/>
                  </React.Fragment>
                }
              </div>              
            </button>
            <button id="newCourseFormCancelButton" onClick={this.handleBack} data-cy="newCourseFormCancelButton">
              <div className="newCourseFormButtonWrapper">
                <span>Cancel</span>
                <FontAwesomeIcon icon={faTimesCircle} style={{"fontSize":"20px", "color":"#fff", "cursor":"pointer", "marginLeft":"8px"}}/>
              </div>
            </button>
          </div>          
        </form>
      </div>  
    );
  }
}

function RoleList(props){
  return (
    <div className="roleListContainer">
      <ul style={{"fontSize":"16px"}}>{
          Object.keys(props.roles).map(function(key) {
            return <li key={key}>{props.roles[key]}</li>
          })}
      </ul>
      </div>
    );
  };

class AddRoleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ""
    };

    this.addRole = this.addRole.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  addRole(event) {
    this.props.addRole(this.state.input);
    this.setState({ input: ""});
    event.preventDefault();
  };

  handleChange(event) {
    this.setState({ input: event.target.value });
  }

  render() {
    return(
      <div className="newCourseFormGroup-4" style={{"display":"flex"}}>
        <input className="newCourseFormInput" type="text" value={this.state.input} onChange={this.handleChange}
        type="text" placeholder="Admin"/>
        <button type="submit" style={{"whiteSpace":"nowrap"}} onClick={this.addRole}>Add Role</button>
      </div>
    )
  }
}

class Accordion extends Component {

  constructor(props) {
    super(props);
    const openSections = {};
    this.state = { openSections };
  }

  onClick = label => {
    const {
      state: { openSections },
    } = this;

    const isOpen = !!openSections[label];

    this.setState({
      openSections: {
        [label]: !isOpen
      }
    });
  };

  render() {
    const {
      onClick,
      props: { children },
      state: { openSections },
    } = this;

    return (
        <AccordionSection
          isOpen={!!openSections[children.props.label]}
          label={children.props.label}
          onClick={onClick}>
          {children.props.children}
        </AccordionSection>
    );
  }
}

class AccordionSection extends Component {

  onClick = () => {
    this.props.onClick(this.props.label);
  };

  render() {
    const {
      onClick,
      props: { isOpen, label },
    } = this;

    return (
      <div style={{ "width":"100%","height":"100%", "cursor":'pointer'}}>
        <div onClick={onClick} data-cy="coursesAccordion"> 
          {isOpen? <FontAwesomeIcon className="menuTwirlIcon" icon={faCaretDown}/> :
          <FontAwesomeIcon className="menuTwirlIcon" icon={faCaretRight}/>}
          {label}
        </div>
        {isOpen && (
          <div>
            {this.props.children}
          </div>
        )}
      </div>
    );
  }
}


export default DoenetChooser;