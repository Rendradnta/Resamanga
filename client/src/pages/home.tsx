import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, Separator } from "@/components/ui";
import { 
  Search, 
  Book, 
  Eye, 
  TrendingUp, 
  Tags, 
  Code, 
  Shield, 
  Globe, 
  Zap,
  ExternalLink,
  Clock,
  AlertCircle,
  Check,
  X
} from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [testUrl, setTestUrl] = useState("");
  const [chapterUrl, setChapterUrl] = useState("");
  const [popularPage, setPopularPage] = useState("1");
  const [selectedGenre, setSelectedGenre] = useState("action");
  const [genrePage, setGenrePage] = useState("1");

  const handleTestEndpoint = (endpoint: string) => {
    console.log(`Testing ${endpoint} endpoint...`);
    // This would make actual API calls in a real implementation
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Code className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">Resamanga API</h1>
                <p className="text-xs text-muted-foreground">API Manga Personal</p>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#overview" className="text-sm font-medium text-foreground hover:text-accent transition-colors">Ringkasan</a>
            <a href="#endpoints" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Endpoint</a>
            <a href="#examples" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Contoh</a>
            <a href="#rate-limits" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Batas Rate</a>
          </nav>

          <div className="flex items-center space-x-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 w-9 border border-border hover:bg-accent hover:text-accent-foreground">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 h-screen sticky top-16 border-r border-border bg-muted/20">
          <ScrollArea className="h-full p-4">
            <nav className="space-y-2">
              <div className="mb-4">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Memulai</h3>
                <div className="space-y-1">
                  <a href="#overview" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-accent bg-accent/10">
                    <AlertCircle className="mr-2 h-3 w-3" />
                    Ringkasan
                  </a>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">API Endpoint</h3>
                <div className="space-y-1">
                  <a href="#search" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Badge variant="secondary" className="mr-2 text-xs bg-green-600 text-white">GET</Badge>
                    Pencarian
                  </a>
                  <a href="#detail" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Badge variant="secondary" className="mr-2 text-xs bg-green-600 text-white">GET</Badge>
                    Detail
                  </a>
                  <a href="#chapter" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Badge variant="secondary" className="mr-2 text-xs bg-green-600 text-white">GET</Badge>
                    Chapter
                  </a>
                  <a href="#popular" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Badge variant="secondary" className="mr-2 text-xs bg-green-600 text-white">GET</Badge>
                    Populer
                  </a>
                  <a href="#genre" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Badge variant="secondary" className="mr-2 text-xs bg-green-600 text-white">GET</Badge>
                    Genre
                  </a>
                </div>
              </div>

              <div>
                <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sumber Daya</h3>
                <div className="space-y-1">
                  <a href="#rate-limits" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Zap className="mr-2 h-3 w-3" />
                    Batas Rate
                  </a>
                  <a href="#errors" className="flex items-center rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <AlertCircle className="mr-2 h-3 w-3" />
                    Kode Error
                  </a>
                </div>
              </div>
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-none">
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            
            {/* Overview Section */}
            <section id="overview" className="mb-12">
              <div className="mb-8">
                <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">Dokumentasi Resamanga API</h1>
                <p className="text-xl text-muted-foreground mb-6">API RESTful yang powerful untuk data manga. Cari, jelajahi, dan akses informasi manga detail secara programmatik.</p>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  <Badge className="bg-accent text-accent-foreground">
                    <Check className="mr-1 h-3 w-3" />
                    RESTful API
                  </Badge>
                  <Badge variant="secondary">
                    <Shield className="mr-1 h-3 w-3" />
                    Rate Limited
                  </Badge>
                  <Badge variant="secondary">
                    <Code className="mr-1 h-3 w-3" />
                    JSON Responses
                  </Badge>
                  <Badge variant="secondary">
                    <Globe className="mr-1 h-3 w-3" />
                    CORS Enabled
                  </Badge>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Search className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Cari Manga</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Cari manga berdasarkan judul dengan informasi detail termasuk genre, chapter, dan gambar cover.</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/search?q=naruto</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Book className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Ambil Detail</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Ambil detail manga lengkap termasuk sinopsis, karakter, dan daftar chapter yang lengkap.</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/detail?url=...</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Jelajahi Populer</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Dapatkan manga trending dan populer dengan dukungan pagination untuk menjelajahi koleksi besar.</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/popular?page=1</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Tags className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Filter berdasarkan Genre</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Jelajahi manga berdasarkan genre spesifik seperti action, romance, fantasy dengan lebih dari 40 kategori tersedia.</p>
                    <div className="bg-muted p-3 rounded-md font-mono text-sm">
                      <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/genre/action?page=1</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-accent" />
                    Mulai Cepat
                  </h3>
                  <p className="text-muted-foreground mb-4">Mulai dengan Resamanga API dalam hitungan detik. Semua endpoint tersedia di URL dasar:</p>
                  <div className="bg-muted p-4 rounded-md font-mono text-sm mb-4">
                    <div className="text-muted-foreground mb-2">// Base URL</div>
                    <div className="text-blue-600">https://apimanga.resa.my.id/api/</div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Contoh Request</h4>
                      <div className="bg-muted p-3 rounded-md font-mono text-xs">
                        <div><span className="text-green-600">curl</span> <span className="text-blue-600">-X GET</span> \</div>
                        <div className="ml-2 text-blue-600">"https://apimanga.resa.my.id/api/search?q=one+piece" \</div>
                        <div className="ml-2"><span className="text-green-600">-H</span> <span className="text-blue-600">"Accept: application/json"</span></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Format Response</h4>
                      <div className="bg-muted p-3 rounded-md font-mono text-xs">
                        <div>{'{'}</div>
                        <div className="ml-2"><span className="text-blue-600">"status"</span>: <span className="text-green-600">true</span>,</div>
                        <div className="ml-2"><span className="text-blue-600">"data"</span>: <span className="text-orange-600">[...]</span>,</div>
                        <div className="ml-2"><span className="text-blue-600">"message"</span>: <span className="text-green-600">"Success"</span></div>
                        <div>{'}'}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints Section */}
            <section id="endpoints" className="mb-12">
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mb-6">API Endpoint</h2>

              <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="search">Pencarian</TabsTrigger>
                  <TabsTrigger value="detail">Detail</TabsTrigger>
                  <TabsTrigger value="chapter">Chapter</TabsTrigger>
                  <TabsTrigger value="popular">Populer</TabsTrigger>
                  <TabsTrigger value="genre">Genre</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Badge className="bg-green-600 text-white">GET</Badge>
                        <span>Cari Manga</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">Cari manga berdasarkan judul. Mengembalikan array manga dengan informasi dasar dan link chapter.</p>
                      
                      <div className="bg-muted p-3 rounded-md font-mono text-sm">
                        <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/search?q={'{query}'}</span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium mb-2">Parameters</h4>
                          <div className="space-y-2">
                            <div className="flex items-start space-x-2">
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">q</code>
                              <div className="flex-1">
                                <div className="text-sm font-medium">Query</div>
                                <div className="text-xs text-muted-foreground">Search term for manga title</div>
                              </div>
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Response Fields</h4>
                          <div className="space-y-1 text-xs">
                            <div><code className="bg-muted px-1 py-0.5 rounded">id</code> - Manga ID</div>
                            <div><code className="bg-muted px-1 py-0.5 rounded">title</code> - Manga title</div>
                            <div><code className="bg-muted px-1 py-0.5 rounded">url</code> - Detail page URL</div>
                            <div><code className="bg-muted px-1 py-0.5 rounded">img</code> - Cover image URL</div>
                            <div><code className="bg-muted px-1 py-0.5 rounded">genre</code> - Array of genres</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-4 w-4 text-accent" />
                          <h5 className="font-medium">Try it out</h5>
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Enter manga title..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                            data-testid="input-search-query"
                          />
                          <Button 
                            onClick={() => handleTestEndpoint('search')}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                            data-testid="button-test-search"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="detail" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Badge className="bg-green-600 text-white">GET</Badge>
                        <span>Get Manga Detail</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">Get comprehensive information about a specific manga including synopsis, chapters, and metadata.</p>
                      
                      <div className="bg-muted p-3 rounded-md font-mono text-sm">
                        <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/detail?url={'{manga_url}'}</span>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-4 w-4 text-accent" />
                          <h5 className="font-medium">Try it out</h5>
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Enter manga URL..." 
                            value={testUrl}
                            onChange={(e) => setTestUrl(e.target.value)}
                            className="flex-1"
                            data-testid="input-detail-url"
                          />
                          <Button 
                            onClick={() => handleTestEndpoint('detail')}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                            data-testid="button-test-detail"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="chapter" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Badge className="bg-green-600 text-white">GET</Badge>
                        <span>Get Chapter Content</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">Retrieve chapter images and metadata for reading a specific manga chapter.</p>
                      
                      <div className="bg-muted p-3 rounded-md font-mono text-sm">
                        <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/chapter?url={'{chapter_url}'}</span>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-900/20 dark:border-amber-800">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">High Resource Usage</span>
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Chapter endpoints may take longer to respond due to image processing. Consider implementing caching.</p>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-4 w-4 text-accent" />
                          <h5 className="font-medium">Try it out</h5>
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            placeholder="Enter chapter URL..." 
                            value={chapterUrl}
                            onChange={(e) => setChapterUrl(e.target.value)}
                            className="flex-1"
                            data-testid="input-chapter-url"
                          />
                          <Button 
                            onClick={() => handleTestEndpoint('chapter')}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                            data-testid="button-test-chapter"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="popular" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Badge className="bg-green-600 text-white">GET</Badge>
                        <span>Get Popular Manga</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">Browse trending and popular manga with pagination support.</p>
                      
                      <div className="bg-muted p-3 rounded-md font-mono text-sm">
                        <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/popular?page={'{page_number}'}</span>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-4 w-4 text-accent" />
                          <h5 className="font-medium">Try it out</h5>
                        </div>
                        <div className="flex space-x-2">
                          <Input 
                            type="number" 
                            min="1" 
                            value={popularPage}
                            onChange={(e) => setPopularPage(e.target.value)}
                            className="w-20"
                            data-testid="input-popular-page"
                          />
                          <Button 
                            onClick={() => handleTestEndpoint('popular')}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                            data-testid="button-test-popular"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="genre" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Badge className="bg-green-600 text-white">GET</Badge>
                        <span>Browse by Genre</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">Filter manga by specific genres. Over 40 genres available for browsing.</p>
                      
                      <div className="bg-muted p-3 rounded-md font-mono text-sm">
                        <span className="text-green-600 font-semibold">GET</span> <span className="text-blue-600">/api/genre/{'{genre}'}?page={'{page_number}'}</span>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Available Genres</h4>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="flex flex-wrap gap-1">
                            {["action", "adventure", "comedy", "drama", "fantasy", "horror", "romance", "sci-fi", "shounen"].map(genre => (
                              <Badge key={genre} variant="secondary" className="text-xs">{genre}</Badge>
                            ))}
                            <Badge variant="secondary" className="text-xs">...and 35+ more</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="h-4 w-4 text-accent" />
                          <h5 className="font-medium">Try it out</h5>
                        </div>
                        <div className="flex space-x-2">
                          <select 
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
                            data-testid="select-genre"
                          >
                            <option value="action">action</option>
                            <option value="adventure">adventure</option>
                            <option value="comedy">comedy</option>
                            <option value="drama">drama</option>
                            <option value="fantasy">fantasy</option>
                            <option value="romance">romance</option>
                          </select>
                          <Input 
                            type="number" 
                            min="1" 
                            value={genrePage}
                            onChange={(e) => setGenrePage(e.target.value)}
                            className="w-20"
                            data-testid="input-genre-page"
                          />
                          <Button 
                            onClick={() => handleTestEndpoint('genre')}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                            data-testid="button-test-genre"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* Rate Limits Section */}
            <section id="rate-limits" className="mb-12">
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mb-6">Rate Limits & Guidelines</h2>
              
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Zap className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Request Limits</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Per minute</span>
                        <Badge variant="outline" className="font-mono">60 requests</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Per hour</span>
                        <Badge variant="outline" className="font-mono">1,000 requests</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Per day</span>
                        <Badge variant="outline" className="font-mono">10,000 requests</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-5 w-5 text-accent" />
                      <h3 className="font-semibold">Response Headers</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><code className="bg-muted px-1.5 py-0.5 rounded text-xs">X-RateLimit-Remaining</code></div>
                      <div><code className="bg-muted px-1.5 py-0.5 rounded text-xs">X-RateLimit-Reset</code></div>
                      <div><code className="bg-muted px-1.5 py-0.5 rounded text-xs">X-RateLimit-Limit</code></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Monitor these headers to track your usage and avoid hitting limits.</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-accent" />
                    Best Practices
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Recommended Usage</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <Check className="h-3 w-3 text-accent mt-1 flex-shrink-0" />
                          <span>Implement client-side caching for frequently requested data</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Check className="h-3 w-3 text-accent mt-1 flex-shrink-0" />
                          <span>Use pagination for large result sets</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Check className="h-3 w-3 text-accent mt-1 flex-shrink-0" />
                          <span>Monitor rate limit headers in responses</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Check className="h-3 w-3 text-accent mt-1 flex-shrink-0" />
                          <span>Implement exponential backoff for retries</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Avoid These Patterns</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <X className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                          <span>Rapid-fire requests without delays</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <X className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                          <span>Requesting the same data repeatedly</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <X className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                          <span>Ignoring HTTP status codes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <X className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                          <span>Not handling rate limit errors gracefully</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Error Handling Section */}
            <section id="errors" className="mb-12">
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight mb-6">Error Handling</h2>
              
              <div className="space-y-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">HTTP Status Codes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded dark:bg-green-900/20 dark:border-green-800">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-600 text-white font-mono">200</Badge>
                          <span className="text-green-800 dark:text-green-200">OK</span>
                        </div>
                        <span className="text-sm text-green-700 dark:text-green-300">Request successful</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded dark:bg-red-900/20 dark:border-red-800">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-red-600 text-white font-mono">400</Badge>
                          <span className="text-red-800 dark:text-red-200">Bad Request</span>
                        </div>
                        <span className="text-sm text-red-700 dark:text-red-300">Invalid parameters or missing required fields</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded dark:bg-red-900/20 dark:border-red-800">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-red-600 text-white font-mono">404</Badge>
                          <span className="text-red-800 dark:text-red-200">Not Found</span>
                        </div>
                        <span className="text-sm text-red-700 dark:text-red-300">Resource not found or invalid URL</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded dark:bg-yellow-900/20 dark:border-yellow-800">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-yellow-600 text-white font-mono">429</Badge>
                          <span className="text-yellow-800 dark:text-yellow-200">Too Many Requests</span>
                        </div>
                        <span className="text-sm text-yellow-700 dark:text-yellow-300">Rate limit exceeded</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded dark:bg-red-900/20 dark:border-red-800">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-red-600 text-white font-mono">500</Badge>
                          <span className="text-red-800 dark:text-red-200">Internal Server Error</span>
                        </div>
                        <span className="text-sm text-red-700 dark:text-red-300">Server error or scraping failure</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Error Response Format</h3>
                    <div className="bg-muted p-4 rounded-md font-mono text-sm">
                      <div>{'{'}</div>
                      <div className="ml-2"><span className="text-blue-600">"status"</span>: <span className="text-orange-600">false</span>,</div>
                      <div className="ml-2"><span className="text-blue-600">"error"</span>: {'{'}</div>
                      <div className="ml-4"><span className="text-blue-600">"code"</span>: <span className="text-green-600">"INVALID_PARAMETER"</span>,</div>
                      <div className="ml-4"><span className="text-blue-600">"message"</span>: <span className="text-green-600">"Missing required parameter: q"</span>,</div>
                      <div className="ml-4"><span className="text-blue-600">"details"</span>: <span className="text-green-600">"Search query parameter is required"</span></div>
                      <div className="ml-2">{'},'},</div>
                      <div className="ml-2"><span className="text-blue-600">"timestamp"</span>: <span className="text-green-600">"2024-01-15T10:30:00Z"</span></div>
                      <div>{'}'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Code className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold">Komiku API</div>
                <div className="text-sm text-muted-foreground">Personal manga scraper service</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Built with ❤️ for personal use</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
