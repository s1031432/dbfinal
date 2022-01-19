<template>
  <div style="width:80%; margin:0 auto;">
    <v-data-table
      :headers="headers"
      :items="desserts"
      sort-by="calories"
      class="elevation-1"
      hide-default-footer
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>DB Final Member</v-toolbar-title>
          <v-divider
            class="mx-4"
            inset
            vertical
          ></v-divider>
          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialog"
            max-width="500px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                New Member
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                  <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.id"
                        label="ID"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.name"
                        label="Name"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.sid"
                        label="SID"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.dep"
                        label="Dep"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.work"
                        label="Work"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.other"
                        label="Other"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="close"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="save"
                >
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">確定要刪除成員嗎？</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogChangePwd" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">請輸入你想設定的密碼</v-card-title>
              <v-card-actions>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-text-field
                          type="password"
                          v-model="editedItem.editedPwd"
                          label="Password"
                          dense 
                          style="min-width:200px;"
                        ></v-text-field>
                        <v-text-field
                          type="password"
                          v-model="editedItem.editedPwdRepeat"
                          label="Repeat-Password"
                          dense 
                          style="min-width:200px;"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-btn color="blue darken-1" text @click="closeChangePwd">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="changePwdConfirm">OK</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          

        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          class="mr-2"
          @click="deleteItem(item)"
        >
          mdi-delete
        </v-icon>
        <v-icon
          small
          @click="changePwd(item)"
        >
          mdi-asterisk
        </v-icon>
      </template>
      <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize"
        >
          Refresh
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import axios from 'axios';
  import md5 from 'js-md5';
  export default {
    data: () => ({
      dialog: false,
      dialogDelete: false,
      dialogChangePwd: false,
      headers: [
        { text: '序號', align: 'center', value: 'id' },
        { text: '名字', align: 'center', value: 'name' },
        { text: '學號', align: 'center', value: 'sid' },
        { text: '系級', align: 'center', value: 'dep' },
        { text: '負責內容', align: 'center', value: 'work' },
        { text: '備註', align: 'center', value: 'other' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      desserts: [],
      editedIndex: -1,
      editedItem: {
        id: '',
        name: '',
        sid: '',
        dep: '',
        work: '',
        other: '',
        editedPwd: '',
        editedPwdRepeat: '',
      },
      defaultItem: {
        id: '',
        name: '',
        sid: '',
        dep: '',
        work: '',
        other: '',
      },
    }),

    computed: {
      formTitle () {
        return this.editedIndex === -1 ? '新成員' : '編輯成員'
      },
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
      dialogChangePwd (val) {
        val || this.closeChangePwd()
      },
    },

    created () {
      this.initialize()
    },

    methods: {
      async initialize () {
        const res = await axios.get('http://140.119.164.151:3000/api/member');
        let content = []
        for(let i=0;i<res.data.length;i++){
          content.push(
            {
              id:res.data[i].member_id,
              name:res.data[i].member_name,
              sid:res.data[i].member_sid,
              dep:res.data[i].member_dep,
              work:res.data[i].member_work,
              other:res.data[i].member_other,
            }
          )
        }
        this.desserts = content;
      },
      editItem (item) {
        this.editedIndex = this.desserts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialog = true
      },
      deleteItem (item) {
        this.editedIndex = this.desserts.indexOf(item)
        this.editedItem = Object.assign({}, item)
        this.dialogDelete = true
      },
      changePwd (item) {
        if(item.sid == localStorage.Authorization){
          this.editedIndex = this.desserts.indexOf(item)
          this.editedItem = Object.assign({}, item)
          this.dialogChangePwd = true
        }
        else{
          alert("你只能更改自己的密碼")
        }
      },
      deleteItemConfirm () {
        axios.delete('http://140.119.164.151:3000/api/member/'+this.editedItem.id);
        this.desserts.splice(this.editedIndex, 1)
        this.closeDelete()
      },
      changePwdConfirm (item) {
        if(this.editedItem.editedPwd === this.editedItem.editedPwdRepeat){
          axios.post('http://140.119.164.151:3000/api/member/changepwd', {
            data : {
              username: localStorage.Authorization,
              password: String(md5(this.editedItem.editedPwd)),
            }
          })
          .then( (res) => {
            console.log(res);
            this.closeChangePwd()
            localStorage.removeItem('Authorization');
            this.$router.push('/login');
            alert('密碼變更成功，請使用新密碼重新登入');
            
          })
          .catch( (err) => {
            console.log(err);
            alert('密碼變更失敗')
          })
          
        }
        else{
          alert('兩次輸入密碼不同')
          this.editedItem.editedPwd = ''
          this.editedItem.editedPwdRepeat = ''
        }
        
      },
      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      closeChangePwd () {
        this.dialogChangePwd = false
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        })
      },
      save () {
        console.log(this.formTitle)
        let memberUrl = 'http://140.119.164.151:3000/api/member/update'
        if(this.formTitle == "新成員")
          memberUrl = 'http://140.119.164.151:3000/api/member'
        axios.post(memberUrl, {
          data : this.editedItem
        })
        .then( (res) => console.log(res) )
        .catch( (err) => console.log(err) )
        if (this.editedIndex > -1) {
          Object.assign(this.desserts[this.editedIndex], this.editedItem)
        } else {
          this.desserts.push(this.editedItem)
        }
        
        this.close()
      },
    },
  }
</script>