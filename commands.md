========================================
UNIX / LINUX & GIT / GITHUB COMMANDS
========================================

Author: Harshita Singh 
Description: Common Unix/Linux and Git/GitHub commands cheat sheet
========================================


----------------------------------------
UNIX / LINUX COMMANDS
----------------------------------------

FILE & DIRECTORY MANAGEMENT
---------------------------
pwd                 - Show current directory
ls                  - List files
ls -la              - List all files (detailed)
cd dir              - Change directory
cd ..               - Go back one directory
mkdir dir           - Create directory
rmdir dir           - Remove empty directory
rm file             - Delete file
rm -r dir           - Delete directory recursively
cp src dst          - Copy file
cp -r src dst       - Copy directory
mv src dst          - Move or rename


FILE VIEWING & EDITING
----------------------
cat file            - Show file content
less file           - Scroll file
more file           - View file
head file           - First 10 lines
tail file           - Last 10 lines
tail -f file        - Live file updates
nano file           - Edit file (nano)
vi file             - Edit file (vim)


SEARCH & TEXT PROCESSING
------------------------
grep "text" file        - Search text
grep -r "text" dir      - Recursive search
find . -name "*.txt"    - Find files
wc file                 - Count lines/words
sort file               - Sort lines
uniq file               - Remove duplicates
cut -d: -f1 file        - Extract column
awk '{print $1}' file   - Print column
sed 's/a/b/' file       - Replace text


PERMISSIONS & OWNERSHIP
-----------------------
chmod 755 file      - Change permission
chmod +x file       - Make executable
chown user file     - Change owner
chown user:group file - Change owner & group


PROCESSES & SYSTEM
------------------
ps                  - Running processes
ps aux              - All processes
top                 - Process monitor
htop                - Enhanced monitor
kill PID            - Kill process
kill -9 PID         - Force kill
df -h               - Disk usage
du -sh dir          - Directory size
free -h             - Memory usage
uptime              - System uptime


NETWORKING
----------
ip a                - Network interfaces
ping host           - Test network
curl url            - HTTP request
wget url            - Download file
ssh user@host       - Remote login
scp file user@host:/path - Secure copy


----------------------------------------
GIT COMMANDS
----------------------------------------

SETUP
-----
git config --global user.name "Name"
git config --global user.email "email"
git config --list


REPOSITORY
----------
git init            - Initialize repo
git clone URL       - Clone repo
git status          - Repo status


STAGING & COMMIT
----------------
git add file        - Stage file
git add .           - Stage all
git commit -m "msg" - Commit changes
git commit -am "msg"- Add & commit tracked files


HISTORY & DIFF
--------------
git log             - Commit history
git log --oneline
git diff            - Unstaged changes
git diff --staged   - Staged changes
git show commit     - Show commit


BRANCHING
---------
git branch          - List branches
git branch name     - Create branch
git checkout name   - Switch branch
git checkout -b n   - Create & switch
git merge branch    - Merge branch
git branch -d name  - Delete branch


UNDO CHANGES
------------
git checkout -- file    - Discard changes
git reset file          - Unstage
git reset --hard HEAD   - Reset everything
git revert commit       - Undo commit safely


----------------------------------------
GITHUB / REMOTE COMMANDS
----------------------------------------

git remote -v
git remote add origin URL
git push origin branch
git push -u origin main
git pull origin branch
git fetch origin


AUTHENTICATION (SSH)
--------------------
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub


ADVANCED GIT
------------
git stash
git stash pop
git rebase branch
git cherry-pick hash
git tag v1.0
git blame file


----------------------------------------
SHELL SHORTCUTS
----------------------------------------

!!              - Repeat last command
Ctrl + C        - Stop process
Ctrl + Z        - Suspend process
Ctrl + R        - Search history
history         - Command history


========================================
END OF FILE
========================================