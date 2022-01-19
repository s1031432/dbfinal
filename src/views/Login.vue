<template>
    <div>
        <input type="text" v-model="loginForm.username" placeholder="使用者名稱"/>
        <input type="text" v-model="loginForm.password" placeholder="密碼"/>
        <button @click="login">登入</button>
    </div>
</template>

<template>
    <div>
        <v-row
            align="center"
            justify="center"
        >
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
                <v-text-field
                    type="text"
                    label="Student ID"
                    hide-details="auto"
                    v-model="loginForm.username"
                ></v-text-field>
            </v-col>
        </v-row>
        <v-row
            align="center"
            justify="center"
        >
            <v-col
                cols="12"
                sm="6"
                md="4"
            >
                <v-text-field 
                    type="password"
                    label="Password (init. is empty)"
                    v-model="loginForm.password"
                ></v-text-field>
            </v-col>
        </v-row/>
        <v-row
            align="center"
            justify="center"
        >
            <v-btn color="blue darken-1" text >Sign Up</v-btn>
            <v-btn color="blue darken-1" text @click="login">Login</v-btn>
        </v-row>
    </div>
</template>
<script>
import { mapMutations } from 'vuex';
import axios from 'axios';
import md5 from 'js-md5';
export default {
    data () {
        return {
            loginForm: {
                username: '',password: ''
            },userToken: ''
        };
    },methods: {
        ...mapMutations(['changeLogin']),login () {
        let _this = this;
        console.log(_this)
        if (this.loginForm.username === '') {
            alert('帳號或密碼不能為空');
        } else {
            axios.post('http://140.119.164.151:3000/api/login', {
                data : {
                    username: _this.loginForm.username,
                    password: md5(_this.loginForm.password),
                }
            })
            .then( (res) => {
                _this.userToken = res.data.data.body.token
                _this.userId = res.data.member_sid
                _this.changeLogin(
                    { 
                        Authorization: _this.userToken,
                    }
                );
                _this.$router.push('/');
                if( _this.loginForm.password == '' ){
                    this.loginForm.password = ''
                    alert('登入成功，初次登入請先修改密碼');
                }
                else{
                    this.loginForm.password = ''
                    alert('登入成功')
                }
            })
            .catch( (err) => {
                this.loginForm.username = ''
                this.loginForm.password = ''
                alert('帳號或密碼錯誤');
                console.log(err);
            })
        }
        }
    },
};
</script>