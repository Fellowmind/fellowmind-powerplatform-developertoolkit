namespace Fellowmind.PowerPlatform.DeveloperToolkit.JS.ConstantGenerator
{
    partial class frmMain
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.txtConnectionstring = new System.Windows.Forms.TextBox();
            this.lblConnectionstring = new System.Windows.Forms.Label();
            this.btnConnect = new System.Windows.Forms.Button();
            this.grpSettings = new System.Windows.Forms.GroupBox();
            this.btnFolderDialog = new System.Windows.Forms.Button();
            this.lblFileLocation = new System.Windows.Forms.Label();
            this.txtFileLocation = new System.Windows.Forms.TextBox();
            this.lblNamespace = new System.Windows.Forms.Label();
            this.chkRemember = new System.Windows.Forms.CheckBox();
            this.lblPrefix = new System.Windows.Forms.Label();
            this.txtNamespace = new System.Windows.Forms.TextBox();
            this.txtPrefix = new System.Windows.Forms.TextBox();
            this.grpGenerate = new System.Windows.Forms.GroupBox();
            this.btnPreview = new System.Windows.Forms.Button();
            this.btnGenerate = new System.Windows.Forms.Button();
            this.chkSelectAll = new System.Windows.Forms.CheckBox();
            this.chkListTables = new System.Windows.Forms.CheckedListBox();
            this.folderDialog = new System.Windows.Forms.FolderBrowserDialog();
            this.txtPreview = new System.Windows.Forms.TextBox();
            this.txtWarnings = new System.Windows.Forms.TextBox();
            this.lblPreview = new System.Windows.Forms.Label();
            this.lblWarnings = new System.Windows.Forms.Label();
            this.grpSettings.SuspendLayout();
            this.grpGenerate.SuspendLayout();
            this.SuspendLayout();
            // 
            // txtConnectionstring
            // 
            this.txtConnectionstring.Location = new System.Drawing.Point(22, 42);
            this.txtConnectionstring.Name = "txtConnectionstring";
            this.txtConnectionstring.Size = new System.Drawing.Size(434, 22);
            this.txtConnectionstring.TabIndex = 0;
            this.txtConnectionstring.TextChanged += new System.EventHandler(this.txtConnectionstring_TextChanged);
            // 
            // lblConnectionstring
            // 
            this.lblConnectionstring.AutoSize = true;
            this.lblConnectionstring.Location = new System.Drawing.Point(19, 23);
            this.lblConnectionstring.Name = "lblConnectionstring";
            this.lblConnectionstring.Size = new System.Drawing.Size(106, 16);
            this.lblConnectionstring.TabIndex = 1;
            this.lblConnectionstring.Text = "Connectionstring";
            // 
            // btnConnect
            // 
            this.btnConnect.Cursor = System.Windows.Forms.Cursors.Hand;
            this.btnConnect.Location = new System.Drawing.Point(22, 70);
            this.btnConnect.Name = "btnConnect";
            this.btnConnect.Size = new System.Drawing.Size(434, 23);
            this.btnConnect.TabIndex = 2;
            this.btnConnect.Text = "Connect to Dataverse";
            this.btnConnect.UseVisualStyleBackColor = true;
            this.btnConnect.Click += new System.EventHandler(this.btnConnect_Click);
            // 
            // grpSettings
            // 
            this.grpSettings.Controls.Add(this.btnFolderDialog);
            this.grpSettings.Controls.Add(this.lblFileLocation);
            this.grpSettings.Controls.Add(this.txtFileLocation);
            this.grpSettings.Controls.Add(this.lblNamespace);
            this.grpSettings.Controls.Add(this.chkRemember);
            this.grpSettings.Controls.Add(this.lblPrefix);
            this.grpSettings.Controls.Add(this.txtNamespace);
            this.grpSettings.Controls.Add(this.txtPrefix);
            this.grpSettings.Location = new System.Drawing.Point(12, 98);
            this.grpSettings.Name = "grpSettings";
            this.grpSettings.Size = new System.Drawing.Size(458, 168);
            this.grpSettings.TabIndex = 3;
            this.grpSettings.TabStop = false;
            this.grpSettings.Text = "File settings";
            // 
            // btnFolderDialog
            // 
            this.btnFolderDialog.Location = new System.Drawing.Point(10, 128);
            this.btnFolderDialog.Name = "btnFolderDialog";
            this.btnFolderDialog.Size = new System.Drawing.Size(100, 23);
            this.btnFolderDialog.TabIndex = 13;
            this.btnFolderDialog.Text = "...";
            this.btnFolderDialog.UseVisualStyleBackColor = true;
            this.btnFolderDialog.Click += new System.EventHandler(this.btnFolderDialog_Click);
            // 
            // lblFileLocation
            // 
            this.lblFileLocation.AutoSize = true;
            this.lblFileLocation.Location = new System.Drawing.Point(7, 109);
            this.lblFileLocation.Name = "lblFileLocation";
            this.lblFileLocation.Size = new System.Drawing.Size(79, 16);
            this.lblFileLocation.TabIndex = 12;
            this.lblFileLocation.Text = "File location";
            // 
            // txtFileLocation
            // 
            this.txtFileLocation.Enabled = false;
            this.txtFileLocation.Location = new System.Drawing.Point(116, 129);
            this.txtFileLocation.Name = "txtFileLocation";
            this.txtFileLocation.ReadOnly = true;
            this.txtFileLocation.Size = new System.Drawing.Size(328, 22);
            this.txtFileLocation.TabIndex = 11;
            // 
            // lblNamespace
            // 
            this.lblNamespace.AutoSize = true;
            this.lblNamespace.Location = new System.Drawing.Point(113, 55);
            this.lblNamespace.Name = "lblNamespace";
            this.lblNamespace.Size = new System.Drawing.Size(134, 16);
            this.lblNamespace.TabIndex = 10;
            this.lblNamespace.Text = "Constant namespace";
            // 
            // chkRemember
            // 
            this.chkRemember.AutoSize = true;
            this.chkRemember.Location = new System.Drawing.Point(10, 26);
            this.chkRemember.Name = "chkRemember";
            this.chkRemember.Size = new System.Drawing.Size(104, 20);
            this.chkRemember.TabIndex = 3;
            this.chkRemember.Text = "Remember?";
            this.chkRemember.UseVisualStyleBackColor = true;
            this.chkRemember.CheckedChanged += new System.EventHandler(this.chkRemember_CheckedChanged);
            // 
            // lblPrefix
            // 
            this.lblPrefix.AutoSize = true;
            this.lblPrefix.Location = new System.Drawing.Point(7, 55);
            this.lblPrefix.Name = "lblPrefix";
            this.lblPrefix.Size = new System.Drawing.Size(64, 16);
            this.lblPrefix.TabIndex = 9;
            this.lblPrefix.Text = "File prefix";
            // 
            // txtNamespace
            // 
            this.txtNamespace.Location = new System.Drawing.Point(116, 74);
            this.txtNamespace.Name = "txtNamespace";
            this.txtNamespace.Size = new System.Drawing.Size(328, 22);
            this.txtNamespace.TabIndex = 8;
            this.txtNamespace.TextChanged += new System.EventHandler(this.txtNamespace_TextChanged);
            // 
            // txtPrefix
            // 
            this.txtPrefix.Location = new System.Drawing.Point(10, 74);
            this.txtPrefix.Name = "txtPrefix";
            this.txtPrefix.Size = new System.Drawing.Size(100, 22);
            this.txtPrefix.TabIndex = 7;
            this.txtPrefix.TextChanged += new System.EventHandler(this.txtPrefix_TextChanged);
            // 
            // grpGenerate
            // 
            this.grpGenerate.Controls.Add(this.btnPreview);
            this.grpGenerate.Controls.Add(this.btnGenerate);
            this.grpGenerate.Controls.Add(this.chkSelectAll);
            this.grpGenerate.Controls.Add(this.chkListTables);
            this.grpGenerate.Location = new System.Drawing.Point(12, 272);
            this.grpGenerate.Name = "grpGenerate";
            this.grpGenerate.Size = new System.Drawing.Size(458, 380);
            this.grpGenerate.TabIndex = 5;
            this.grpGenerate.TabStop = false;
            this.grpGenerate.Text = "Tables";
            // 
            // btnPreview
            // 
            this.btnPreview.Cursor = System.Windows.Forms.Cursors.Hand;
            this.btnPreview.Location = new System.Drawing.Point(10, 312);
            this.btnPreview.Name = "btnPreview";
            this.btnPreview.Size = new System.Drawing.Size(434, 23);
            this.btnPreview.TabIndex = 7;
            this.btnPreview.Text = "Preview constants";
            this.btnPreview.UseVisualStyleBackColor = true;
            this.btnPreview.Click += new System.EventHandler(this.btnPreview_Click);
            // 
            // btnGenerate
            // 
            this.btnGenerate.Cursor = System.Windows.Forms.Cursors.Hand;
            this.btnGenerate.Location = new System.Drawing.Point(10, 341);
            this.btnGenerate.Name = "btnGenerate";
            this.btnGenerate.Size = new System.Drawing.Size(434, 23);
            this.btnGenerate.TabIndex = 6;
            this.btnGenerate.Text = "Generate constants to file";
            this.btnGenerate.UseVisualStyleBackColor = true;
            this.btnGenerate.Click += new System.EventHandler(this.btnGenerate_Click);
            // 
            // chkSelectAll
            // 
            this.chkSelectAll.AutoSize = true;
            this.chkSelectAll.Location = new System.Drawing.Point(353, 21);
            this.chkSelectAll.Name = "chkSelectAll";
            this.chkSelectAll.Size = new System.Drawing.Size(91, 20);
            this.chkSelectAll.TabIndex = 6;
            this.chkSelectAll.Text = "Select all?";
            this.chkSelectAll.UseVisualStyleBackColor = true;
            this.chkSelectAll.CheckedChanged += new System.EventHandler(this.chkSelectAll_CheckedChanged);
            // 
            // chkListTables
            // 
            this.chkListTables.FormattingEnabled = true;
            this.chkListTables.Location = new System.Drawing.Point(10, 47);
            this.chkListTables.Name = "chkListTables";
            this.chkListTables.Size = new System.Drawing.Size(434, 259);
            this.chkListTables.TabIndex = 5;
            this.chkListTables.ItemCheck += new System.Windows.Forms.ItemCheckEventHandler(this.chkListTables_ItemCheck);
            // 
            // txtPreview
            // 
            this.txtPreview.Location = new System.Drawing.Point(476, 42);
            this.txtPreview.Multiline = true;
            this.txtPreview.Name = "txtPreview";
            this.txtPreview.ReadOnly = true;
            this.txtPreview.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.txtPreview.Size = new System.Drawing.Size(778, 394);
            this.txtPreview.TabIndex = 6;
            // 
            // txtWarnings
            // 
            this.txtWarnings.Location = new System.Drawing.Point(476, 458);
            this.txtWarnings.Multiline = true;
            this.txtWarnings.Name = "txtWarnings";
            this.txtWarnings.ReadOnly = true;
            this.txtWarnings.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.txtWarnings.Size = new System.Drawing.Size(778, 194);
            this.txtWarnings.TabIndex = 7;
            // 
            // lblPreview
            // 
            this.lblPreview.AutoSize = true;
            this.lblPreview.Location = new System.Drawing.Point(476, 23);
            this.lblPreview.Name = "lblPreview";
            this.lblPreview.Size = new System.Drawing.Size(55, 16);
            this.lblPreview.TabIndex = 14;
            this.lblPreview.Text = "Preview";
            // 
            // lblWarnings
            // 
            this.lblWarnings.AutoSize = true;
            this.lblWarnings.Location = new System.Drawing.Point(473, 439);
            this.lblWarnings.Name = "lblWarnings";
            this.lblWarnings.Size = new System.Drawing.Size(64, 16);
            this.lblWarnings.TabIndex = 15;
            this.lblWarnings.Text = "Warnings";
            // 
            // frmMain
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1266, 665);
            this.Controls.Add(this.btnConnect);
            this.Controls.Add(this.lblWarnings);
            this.Controls.Add(this.lblPreview);
            this.Controls.Add(this.txtConnectionstring);
            this.Controls.Add(this.lblConnectionstring);
            this.Controls.Add(this.txtWarnings);
            this.Controls.Add(this.txtPreview);
            this.Controls.Add(this.grpGenerate);
            this.Controls.Add(this.grpSettings);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "frmMain";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Fellowmind JS Constant Generator";
            this.Load += new System.EventHandler(this.frmMain_Load);
            this.grpSettings.ResumeLayout(false);
            this.grpSettings.PerformLayout();
            this.grpGenerate.ResumeLayout(false);
            this.grpGenerate.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox txtConnectionstring;
        private System.Windows.Forms.Label lblConnectionstring;
        private System.Windows.Forms.Button btnConnect;
        private System.Windows.Forms.GroupBox grpSettings;
        private System.Windows.Forms.CheckBox chkRemember;
        private System.Windows.Forms.GroupBox grpGenerate;
        private System.Windows.Forms.Button btnGenerate;
        private System.Windows.Forms.CheckBox chkSelectAll;
        private System.Windows.Forms.CheckedListBox chkListTables;
        private System.Windows.Forms.Label lblNamespace;
        private System.Windows.Forms.Label lblPrefix;
        private System.Windows.Forms.TextBox txtNamespace;
        private System.Windows.Forms.TextBox txtPrefix;
        private System.Windows.Forms.Button btnFolderDialog;
        private System.Windows.Forms.Label lblFileLocation;
        private System.Windows.Forms.TextBox txtFileLocation;
        private System.Windows.Forms.FolderBrowserDialog folderDialog;
        private System.Windows.Forms.Button btnPreview;
        private System.Windows.Forms.TextBox txtPreview;
        private System.Windows.Forms.TextBox txtWarnings;
        private System.Windows.Forms.Label lblPreview;
        private System.Windows.Forms.Label lblWarnings;
    }
}

