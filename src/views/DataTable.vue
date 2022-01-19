<template>
  <div style="width:80%; margin:0 auto;">
    <v-data-table
      :headers="headers"
      :items="desserts"
      sort-by="id"
      class="elevation-1"
    >
      <template v-slot:top>
        <v-toolbar
          flat
        >
          <v-toolbar-title>統計表</v-toolbar-title>
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
                @click="getsid"
              >
                New Item
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
                        v-model="editedItem.name"
                        label="帳號"
                        disabled
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.eth"
                        label="提領數量"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedItem.txt"
                        label="備註"
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
              <v-card-title class="text-h5">Cancel？</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">否</v-btn>
                <v-btn color="red darken-1" text @click="deleteItemConfirm">是</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
          <v-btn
              class="ma-2"
              color="#cc3333"
              @click="deleteItem(item)"
              dark
          >
              Cancel
              <v-icon
                  dark
                  right
              >
                  mdi-cancel
              </v-icon>
          </v-btn>
      </template>
      <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize"
        >
          沒有資料啦
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import axios from 'axios';
export default {
    data: () => ({
        dialog: false,
        dialogDelete: false,
        headers: [
            { text: 'TX ID', align: 'center', value: 'id' },
            { text: '學號' , align: 'center', value: 'name' },            
            { text: '提領數量', align: 'center', value: 'eth' },
            { text: '備註', align: 'center', value: 'txt' },
            { text: '取消', align: 'center', value: 'actions', sortable: false },
        ],
        desserts: [],
        editedIndex: -1,
        editedItem: {
            id: '',
            name: '',
            eth: 0,
            txt: 0,
            timestamp: '1990/01/01/ 00:00:00',
        },
        defaultItem: {
            id: '',
            name: '',
            eth: 0,
            txt: 0,
            timestamp: '1990/01/01/ 00:00:00',
        },
    }),
    computed: {
        formTitle () {
            return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
        },
    },
    watch: {
        dialog (val) {
            val || this.close()
        },
        dialogDelete (val) {
            val || this.closeDelete()
        },
    },
    created () {
        this.initialize()
    },
    mounted () {
        this.initialize()
    },
    methods: {
        async initialize () {
          const res = await axios.get('http://140.119.164.151:3000/api/payout');
          let content = []
          for(let i=0;i<res.data.length;i++){
            content.push(
              {
                id:res.data[i].payout_id,
                name:res.data[i].payout_name,
                eth:res.data[i].payout_eth,
                txt:res.data[i].payout_txt,
                timestamp:res.data[i].payout_timestamp
              }
            )
          }
          this.desserts = content;
        },
        deleteItem (item) {
            this.editedIndex = this.desserts.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        async deleteItemConfirm () {
          axios.delete('http://140.119.164.151:3000/api/payout/'+this.editedItem.id);
          this.desserts.splice(this.editedIndex, 1)
          this.closeDelete()
        },
        getsid() {
          this.editedItem.name = localStorage.Authorization;
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
        async save () {
            // db update, delete
            console.log(this.editedItem);
            axios.post('http://140.119.164.151:3000/api/payout', {
              data : this.editedItem
            })
            .then( (res) => {
              console.log(res)
              this.initialize()
            })
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