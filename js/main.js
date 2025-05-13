document.addEventListener('DOMContentLoaded', () => {
    const contentFrame = document.getElementById('content-frame');
    const leftSidebar = document.getElementById('left-sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const treeNav = document.getElementById('tree-nav');
    const treeSearchInput = document.getElementById('tree-search');
    const topTabsContainer = document.getElementById('top-tabs');
    const contextMenu = document.getElementById('contextMenu');
    let currentContextItem = null;

    // --- Sidebar Toggle ---
    toggleSidebarBtn.addEventListener('click', () => {
        const icon = toggleSidebarBtn.querySelector('i');
        leftSidebar.classList.toggle('w-64'); // Default expanded width
        leftSidebar.classList.toggle('w-20');  // Collapsed width
        
        // Toggle text visibility for sidebar elements
        const sidebarTexts = leftSidebar.querySelectorAll('.sidebar-text');
        sidebarTexts.forEach(textEl => {
            textEl.classList.toggle('hidden');
        });

        // Adjust icon for toggle button
        if (leftSidebar.classList.contains('w-20')) {
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
            leftSidebar.querySelectorAll('.chevron-icon').forEach(ci => ci.classList.add('hidden'));

        } else {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
            leftSidebar.querySelectorAll('.chevron-icon').forEach(ci => ci.classList.remove('hidden'));
        }
    });

    // --- Tree Navigation ---
    treeNav.addEventListener('click', (e) => {
        const target = e.target.closest('.tree-node-header, .tree-item-leaf');
        if (!target) return;

        // Handle item selection visual state
        treeNav.querySelectorAll('.tree-item-active').forEach(item => item.classList.remove('tree-item-active', 'bg-blue-100', 'border-l-2', 'border-blue-500'));
        target.closest('.tree-item, .tree-item-leaf').classList.add('tree-item-active', 'bg-blue-100', 'border-l-2', 'border-blue-500');
        
        // Handle expansion/collapse for folders
        if (target.classList.contains('tree-node-header')) {
            const parentItem = target.closest('.tree-item');
            if (parentItem) {
                parentItem.classList.toggle('open');
            }
        }

        // Handle iframe source update (for leaves or folder headers if they also navigate)
        const pathElement = target.querySelector('[data-path]') || target.closest('[data-path]') || (target.matches('[data-path]') ? target : null);
        if (pathElement && pathElement.dataset.path) {
             contentFrame.src = pathElement.dataset.path;
        } else if(target.dataset.path) { // If the target itself has data-path (like leaf spans)
            contentFrame.src = target.dataset.path;
        } else { // Fallback for direct click on span inside leaf or header
            const spanWithPath = target.querySelector('span[data-path]');
            if(spanWithPath) contentFrame.src = spanWithPath.dataset.path;
        }

        // Hide context menu if open
        contextMenu.style.display = 'none';
    });
    
    // --- Context Menu ---
    treeNav.addEventListener('contextmenu', (e) => {
        const targetNode = e.target.closest('.tree-node-header, .tree-item-leaf');
        if (!targetNode) return;

        e.preventDefault();
        currentContextItem = targetNode; // Store the item for actions

        // Basic positioning
        const rect = document.body.getBoundingClientRect(); // Use body for general positioning
        let x = e.clientX;
        let y = e.clientY;

        // Adjust if menu would go off-screen
        if (x + contextMenu.offsetWidth > window.innerWidth) {
            x = window.innerWidth - contextMenu.offsetWidth - 5;
        }
        if (y + contextMenu.offsetHeight > window.innerHeight) {
            y = window.innerHeight - contextMenu.offsetHeight - 5;
        }

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
    });

    // Hide context menu on click outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
            currentContextItem = null;
        }
    });

    // Context menu actions (example)
    contextMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action && currentContextItem) {
            const itemName = currentContextItem.querySelector('span')?.textContent || "selected item";
            console.log(`Action: ${action} on item: ${itemName}`);
            alert(`Action: ${action} on item: "${itemName}"`);
            // Implement actual actions here, e.g., renaming, deleting, opening modals
        }
        contextMenu.style.display = 'none';
        currentContextItem = null;
    });


    // --- Tree Search (Basic Filter) ---
    treeSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const treeItems = treeNav.querySelectorAll('.tree-item, .tree-item-leaf');

        treeItems.forEach(item => {
            const textContent = item.querySelector('span')?.textContent.toLowerCase() || "";
            const isMatch = textContent.includes(searchTerm);
            
            // For folders (tree-item), if any child matches, show the folder
            if (item.classList.contains('tree-item')) {
                let hasMatchingChild = false;
                item.querySelectorAll('.tree-item-leaf').forEach(leaf => {
                    if ((leaf.querySelector('span')?.textContent.toLowerCase() || "").includes(searchTerm)) {
                        hasMatchingChild = true;
                        leaf.style.display = ''; // Show matching leaf
                    } else {
                        leaf.style.display = 'none'; // Hide non-matching leaf
                    }
                });
                // Show folder if its name matches or if it has a matching child
                item.style.display = (isMatch || hasMatchingChild) ? '' : 'none';
                if (isMatch || hasMatchingChild) { // if folder matches, ensure its direct children that *also* match are visible
                     item.querySelectorAll(':scope > ul > .tree-item-leaf').forEach(directLeaf => {
                        if ((directLeaf.querySelector('span')?.textContent.toLowerCase() || "").includes(searchTerm)) {
                            directLeaf.style.display = '';
                        } else if (!hasMatchingChild) { // if folder only matches by name, but children dont
                             directLeaf.style.display = 'none';
                        }
                     });
                }


            } else { // For leaves (tree-item-leaf)
                 item.style.display = isMatch ? '' : 'none';
            }
        });
    });

    // --- Top Tabs ---
    topTabsContainer.addEventListener('click', (e) => {
        const targetTab = e.target.closest('.top-tab-item');
        if (!targetTab) return;
        
        e.preventDefault();

        // Update active tab style
        topTabsContainer.querySelectorAll('.top-tab-item').forEach(tab => {
            tab.classList.remove('active-tab', 'border-blue-500', 'text-blue-500');
            tab.classList.add('border-transparent', 'text-gray-500');
        });
        targetTab.classList.add('active-tab', 'border-blue-500', 'text-blue-500');
        targetTab.classList.remove('border-transparent', 'text-gray-500');

        // Change iframe source
        const page = targetTab.dataset.page;
        if (page) {
            contentFrame.src = page;
        }
    });

    // --- Refresh Tree (Example) ---
    document.getElementById('refresh-tree').addEventListener('click', () => {
        // In a real app, this would re-fetch tree data
        alert('Refreshing tree structure (simulated).');
        // For now, just re-apply search if any
        treeSearchInput.dispatchEvent(new Event('input')); 
        // Or reload the initial iframe
        // contentFrame.src = "pages/welcome_dashboard.html"; 
    });
    
    // Simulate initial active state for the tree (if any)
    const initialActiveTreeItem = treeNav.querySelector('.tree-item-active');
    if (initialActiveTreeItem) {
        const pathElement = initialActiveTreeItem.querySelector('[data-path]') || initialActiveTreeItem.closest('[data-path]') || (initialActiveTreeItem.matches('[data-path]') ? initialActiveTreeItem : null);
        if (pathElement && pathElement.dataset.path) {
            contentFrame.src = pathElement.dataset.path;
        } else {
            const spanWithPath = initialActiveTreeItem.querySelector('span[data-path]');
            if(spanWithPath) contentFrame.src = spanWithPath.dataset.path;
        }
        // Ensure parent is open if active item is a child
        let parent = initialActiveTreeItem.closest('.tree-item:not(.open)');
        while(parent) {
            parent.classList.add('open');
            parent = parent.parentElement.closest('.tree-item:not(.open)');
        }
    }


});